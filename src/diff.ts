import { defaultConfig } from './config.js';
import type { DiffItem, DiffResult, EnvreceiptConfig, Receipt, Severity } from './types.js';

type RuleConfig = Pick<Required<EnvreceiptConfig>, 'severity'>;

export function diffReceipts(
  before: Receipt,
  after: Receipt,
  options: { severity?: EnvreceiptConfig['severity']; comparedAt?: Date } = {}
): DiffResult {
  const rules: RuleConfig = {
    severity: {
      fail: [...(defaultConfig.severity.fail ?? []), ...(options.severity?.fail ?? [])],
      warn: [...(defaultConfig.severity.warn ?? []), ...(options.severity?.warn ?? [])]
    }
  };

  const items: DiffItem[] = [];
  compare(items, 'os.platform', before.os.platform, after.os.platform, rules, 'Operating system platform changed');
  compare(items, 'os.release', before.os.release, after.os.release, rules, 'Operating system release changed');
  compare(items, 'os.arch', before.os.arch, after.os.arch, rules, 'Operating system architecture changed');
  compare(items, 'shell', before.shell, after.shell, rules, 'Shell changed');
  compareTools(items, before, after, rules);
  compare(items, 'packageManager.name', before.packageManager.name, after.packageManager.name, rules, 'Package manager changed');
  compare(items, 'packageManager.lockfiles', lockfileMap(before), lockfileMap(after), rules, 'Lockfile fingerprints changed');
  compare(items, 'packageManager.dependencies', before.packageManager.packageJson?.dependencies, after.packageManager.packageJson?.dependencies, rules, 'Dependencies changed');
  compare(items, 'packageManager.devDependencies', before.packageManager.packageJson?.devDependencies, after.packageManager.packageJson?.devDependencies, rules, 'Dev dependencies changed');
  compare(items, 'git.head', before.git.head, after.git.head, rules, 'Git HEAD changed');
  compare(items, 'git.dirty', before.git.dirty, after.git.dirty, rules, 'Git dirty state changed');
  compare(items, 'env', envMap(before), envMap(after), rules, 'Environment key states changed');
  compare(items, 'configFiles', fileMap(before), fileMap(after), rules, 'Config file fingerprints changed');
  compare(items, 'extraCommands', commandMap(before.extraCommands), commandMap(after.extraCommands), rules, 'Extra command output changed');

  const sorted = items.sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || a.path.localeCompare(b.path));

  return {
    schemaVersion: '1',
    comparedAt: (options.comparedAt ?? new Date()).toISOString(),
    before: before.generatedAt,
    after: after.generatedAt,
    items: sorted,
    summary: {
      fail: sorted.filter((item) => item.severity === 'fail').length,
      warn: sorted.filter((item) => item.severity === 'warn').length,
      info: sorted.filter((item) => item.severity === 'info').length
    }
  };
}

function compare(
  items: DiffItem[],
  path: string,
  before: unknown,
  after: unknown,
  rules: RuleConfig,
  message: string
) {
  if (stableStringify(before) === stableStringify(after)) {
    return;
  }

  items.push({
    path,
    severity: severityFor(path, rules),
    before,
    after,
    message
  });
}

function compareTools(items: DiffItem[], before: Receipt, after: Receipt, rules: RuleConfig) {
  const beforeTools = commandMap(before.tools);
  const afterTools = commandMap(after.tools);
  for (const tool of [...new Set([...Object.keys(beforeTools), ...Object.keys(afterTools)])].sort()) {
    compare(items, `tools.${tool}`, beforeTools[tool], afterTools[tool], rules, `${tool} version changed`);
  }
}

function severityFor(path: string, rules: RuleConfig): Severity {
  if ((rules.severity.fail ?? []).some((rule) => path.startsWith(rule))) {
    return 'fail';
  }
  if ((rules.severity.warn ?? []).some((rule) => path.startsWith(rule))) {
    return 'warn';
  }
  return 'info';
}

function severityRank(severity: Severity): number {
  return severity === 'fail' ? 3 : severity === 'warn' ? 2 : 1;
}

function commandMap(commands: Receipt['tools']): Record<string, unknown> {
  return Object.fromEntries(commands.map((item) => [item.name, item.ok ? item.stdout : { ok: false, stderr: item.stderr }]).sort());
}

function envMap(receipt: Receipt): Record<string, unknown> {
  return Object.fromEntries(receipt.env.map((item) => [item.key, { state: item.state, value: item.value }]).sort());
}

function fileMap(receipt: Receipt): Record<string, unknown> {
  return Object.fromEntries(receipt.configFiles.map((item) => [item.path, item.hash]).sort());
}

function lockfileMap(receipt: Receipt): Record<string, unknown> {
  return Object.fromEntries(receipt.packageManager.lockfiles.map((item) => [item.path, item.hash]).sort());
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, sortValue(item)]));
  }
  return value;
}

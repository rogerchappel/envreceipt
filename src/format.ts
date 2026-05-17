import type { DiffResult, Receipt, Severity } from './types.js';

export function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2) + '\n';
}

export function formatReceiptMarkdown(receipt: Receipt): string {
  const gitText = receipt.git.available
    ? (receipt.git.branch ?? 'detached') + '@' + (receipt.git.head ?? 'unknown') + (receipt.git.dirty ? ' dirty' : '')
    : 'unavailable';

  const lines = [
    '# Environment Receipt',
    '',
    'Generated: ' + receipt.generatedAt,
    'Project: ' + receipt.projectRoot,
    '',
    '## System',
    '',
    '- OS: ' + receipt.os.platform + ' ' + receipt.os.release + ' ' + receipt.os.arch,
    '- Shell: ' + (receipt.shell ?? 'unknown'),
    '- Package manager: ' + receipt.packageManager.name,
    '- Git: ' + gitText,
    '',
    '## Tools',
    '',
    ...receipt.tools.map((tool) => '- ' + tool.name + ': ' + (tool.ok ? tool.stdout ?? 'ok' : 'unavailable')),
    '',
    '## Environment',
    '',
    ...receipt.env.map((item) => '- ' + item.key + ': ' + item.state + (item.value ? ' (' + item.value + ')' : '') + (item.reason ? ' - ' + item.reason : '')),
    '',
    '## Config Fingerprints',
    '',
    ...receipt.configFiles.map((file) => '- ' + file.path + ': ' + file.hash.slice(0, 12) + '... (' + file.bytes + ' bytes)')
  ];

  return lines.join('\n') + '\n';
}

export function formatDiffMarkdown(diff: DiffResult): string {
  const lines = [
    '# Environment Receipt Diff',
    '',
    'Compared: ' + diff.comparedAt,
    'Summary: ' + diff.summary.fail + ' fail, ' + diff.summary.warn + ' warn, ' + diff.summary.info + ' info',
    ''
  ];

  if (diff.items.length === 0) {
    lines.push('No differences found.', '');
    return lines.join('\n') + '\n';
  }

  for (const severity of ['fail', 'warn', 'info'] as Severity[]) {
    const items = diff.items.filter((item) => item.severity === severity);
    if (items.length === 0) {
      continue;
    }

    lines.push(severity.toUpperCase(), '');
    for (const item of items) {
      lines.push('- ' + item.path + ': ' + item.message);
      lines.push('  - before: ' + inlineValue(item.before));
      lines.push('  - after: ' + inlineValue(item.after));
    }
    lines.push('');
  }

  return lines.join('\n') + '\n';
}

function inlineValue(value: unknown): string {
  if (value === undefined) {
    return 'missing';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

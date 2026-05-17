import { runCommand } from './commands.js';
import type { GitReceipt } from './types.js';

export async function collectGit(projectRoot: string): Promise<GitReceipt> {
  const inside = await runGit(projectRoot, ['rev-parse', '--is-inside-work-tree']);
  if (!inside.ok || inside.stdout !== 'true') {
    return { available: false };
  }

  const [head, branch, status] = await Promise.all([
    runGit(projectRoot, ['rev-parse', '--short=12', 'HEAD']),
    runGit(projectRoot, ['branch', '--show-current']),
    runGit(projectRoot, ['status', '--porcelain'])
  ]);

  const statusLines = status.stdout?.split(/\r?\n/).filter(Boolean).sort() ?? [];

  return {
    available: true,
    head: head.ok ? head.stdout : undefined,
    branch: branch.ok ? branch.stdout : undefined,
    dirty: statusLines.length > 0,
    changedFiles: statusLines.length,
    statusSummary: statusLines.slice(0, 50)
  };
}

function runGit(projectRoot: string, args: string[]) {
  return runCommand('git', 'git', ['-C', projectRoot, ...args]);
}

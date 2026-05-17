import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { sanitizeCommandOutput } from './redact.js';
import type { CommandReceipt } from './types.js';

const execFileAsync = promisify(execFile);

export async function runCommand(name: string, command: string, args: string[] = []): Promise<CommandReceipt> {
  const rendered = [command, ...args].join(' ');
  try {
    const result = await execFileAsync(command, args, {
      timeout: 5000,
      maxBuffer: 1024 * 1024,
      windowsHide: true
    });

    return {
      name,
      command: rendered,
      ok: true,
      stdout: sanitizeCommandOutput(result.stdout.trim())
    };
  } catch (error) {
    const failure = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string; code?: number | string };
    return {
      name,
      command: rendered,
      ok: false,
      stdout: failure.stdout ? sanitizeCommandOutput(failure.stdout.trim()) : undefined,
      stderr: failure.stderr ? sanitizeCommandOutput(failure.stderr.trim()) : failure.message,
      exitCode: typeof failure.code === 'number' ? failure.code : undefined
    };
  }
}

export async function runShellCommand(name: string, command: string): Promise<CommandReceipt> {
  const shell = process.platform === 'win32' ? 'cmd.exe' : 'sh';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', command] : ['-c', command];
  return runCommand(name, shell, args);
}

export async function detectToolVersions(): Promise<CommandReceipt[]> {
  const commands: Array<[string, string, string[]]> = [
    ['node', process.execPath, ['--version']],
    ['npm', 'npm', ['--version']],
    ['pnpm', 'pnpm', ['--version']],
    ['yarn', 'yarn', ['--version']],
    ['bun', 'bun', ['--version']],
    ['git', 'git', ['--version']]
  ];

  return Promise.all(commands.map(([name, command, args]) => runCommand(name, command, args)));
}

import os from 'node:os';
import path from 'node:path';
import { detectToolVersions, runShellCommand } from './commands.js';
import { loadConfig } from './config.js';
import { fingerprintFile, sortByPath } from './fs.js';
import { collectGit } from './git.js';
import { collectPackageManager } from './package-manager.js';
import { redactEnv } from './redact.js';
import type { Receipt } from './types.js';

export type CaptureOptions = {
  config?: string;
  now?: Date;
  env?: NodeJS.ProcessEnv;
};

export async function captureReceipt(projectPath: string, options: CaptureOptions = {}): Promise<Receipt> {
  const projectRoot = path.resolve(projectPath);
  const config = await loadConfig(projectRoot, options.config);
  const env = options.env ?? process.env;

  const [tools, packageManager, git, configFiles, extraCommands] = await Promise.all([
    detectToolVersions(),
    collectPackageManager(projectRoot),
    collectGit(projectRoot),
    collectConfigFiles(projectRoot, config.configFiles),
    Promise.all(config.extraCommands.map((item) => runShellCommand(item.name, item.command)))
  ]);

  return {
    schemaVersion: '1',
    generatedAt: (options.now ?? new Date()).toISOString(),
    projectRoot: path.basename(projectRoot),
    os: {
      platform: process.platform,
      release: os.release(),
      arch: os.arch()
    },
    shell: env.SHELL ?? env.ComSpec,
    tools: tools.sort((a, b) => a.name.localeCompare(b.name)),
    packageManager,
    git,
    env: redactEnv(env, config.env.allow, config.env.reveal),
    configFiles,
    extraCommands: extraCommands.sort((a, b) => a.name.localeCompare(b.name))
  };
}

async function collectConfigFiles(projectRoot: string, files: string[]) {
  const fingerprints = await Promise.all(files.map((file) => fingerprintFile(projectRoot, file)));
  return sortByPath(fingerprints.filter((item) => item !== null));
}

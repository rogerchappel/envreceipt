import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathExists } from './fs.js';
import type { EnvreceiptConfig } from './types.js';

export const defaultConfig: Required<EnvreceiptConfig> = {
  env: {
    allow: ['CI', 'NODE_ENV', 'SHELL', 'TERM', 'USER', 'USERNAME'],
    reveal: ['CI', 'NODE_ENV', 'TERM']
  },
  configFiles: [
    'package.json',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'bun.lockb',
    'tsconfig.json',
    '.nvmrc',
    '.node-version',
    '.npmrc'
  ],
  ignorePaths: ['node_modules', 'dist', 'coverage', '.git'],
  extraCommands: [],
  severity: {
    fail: ['tools.node', 'packageManager.name', 'packageManager.lockfiles', 'configFiles'],
    warn: ['os.platform', 'tools.npm', 'tools.pnpm', 'tools.yarn', 'tools.git', 'env']
  }
};

export async function loadConfig(projectRoot: string, explicitConfig?: string): Promise<Required<EnvreceiptConfig>> {
  const configPath = explicitConfig
    ? path.resolve(projectRoot, explicitConfig)
    : path.resolve(projectRoot, 'envreceipt.config.json');

  const userConfig = await pathExists(configPath)
    ? parseConfig(await readFile(configPath, 'utf8'), configPath)
    : {};

  return mergeConfig(defaultConfig, userConfig);
}

export function parseConfig(source: string, label = 'envreceipt config'): EnvreceiptConfig {
  const parsed = JSON.parse(source) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object`);
  }

  return parsed as EnvreceiptConfig;
}

function mergeConfig(base: Required<EnvreceiptConfig>, user: EnvreceiptConfig): Required<EnvreceiptConfig> {
  return {
    env: {
      allow: unique([...(base.env.allow ?? []), ...(user.env?.allow ?? [])]),
      reveal: unique([...(base.env.reveal ?? []), ...(user.env?.reveal ?? [])])
    },
    configFiles: unique([...(base.configFiles ?? []), ...(user.configFiles ?? [])]),
    ignorePaths: unique([...(base.ignorePaths ?? []), ...(user.ignorePaths ?? [])]),
    extraCommands: [...(base.extraCommands ?? []), ...(user.extraCommands ?? [])],
    severity: {
      fail: unique([...(base.severity.fail ?? []), ...(user.severity?.fail ?? [])]),
      warn: unique([...(base.severity.warn ?? []), ...(user.severity?.warn ?? [])])
    }
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values)].filter(Boolean).sort();
}

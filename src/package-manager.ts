import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fingerprintFile, pathExists, sortByPath } from './fs.js';
import type { PackageManagerReceipt } from './types.js';

const lockfiles = [
  ['package-lock.json', 'npm'],
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lockb', 'bun']
] as const;

export async function collectPackageManager(projectRoot: string): Promise<PackageManagerReceipt> {
  const fingerprints = (await Promise.all(lockfiles.map(([file]) => fingerprintFile(projectRoot, file))))
    .filter((item) => item !== null);

  const detected = lockfiles.find(([file]) => fingerprints.some((fingerprint) => fingerprint.path === file))?.[1] ?? 'unknown';
  const packageJson = await readPackageJson(projectRoot);

  return {
    name: packageJson?.packageManager?.split('@')[0] as PackageManagerReceipt['name'] ?? detected,
    lockfiles: sortByPath(fingerprints),
    packageJson
  };
}

async function readPackageJson(projectRoot: string): Promise<PackageManagerReceipt['packageJson'] | undefined> {
  const packagePath = path.resolve(projectRoot, 'package.json');
  if (!await pathExists(packagePath)) {
    return undefined;
  }

  const parsed = JSON.parse(await readFile(packagePath, 'utf8')) as Record<string, unknown>;
  return {
    name: stringValue(parsed.name),
    version: stringValue(parsed.version),
    packageManager: stringValue(parsed.packageManager),
    dependencies: recordOfStrings(parsed.dependencies),
    devDependencies: recordOfStrings(parsed.devDependencies)
  };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function recordOfStrings(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
      .sort(([a], [b]) => a.localeCompare(b))
  );
}

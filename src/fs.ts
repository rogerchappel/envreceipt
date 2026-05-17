import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import type { FileFingerprint } from './types.js';

export function normalizeRelativePath(projectRoot: string, target: string): string {
  return path.relative(projectRoot, path.resolve(projectRoot, target)).split(path.sep).join('/');
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function fingerprintFile(projectRoot: string, relativePath: string): Promise<FileFingerprint | null> {
  const absolutePath = path.resolve(projectRoot, relativePath);
  if (!await pathExists(absolutePath)) {
    return null;
  }

  const bytes = await readFile(absolutePath);
  return {
    path: normalizeRelativePath(projectRoot, absolutePath),
    algorithm: 'sha256',
    hash: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length
  };
}

export function sortByPath<T extends { path: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.path.localeCompare(b.path));
}

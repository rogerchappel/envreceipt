import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Receipt } from './types.js';

export async function writeTextFile(filePath: string, contents: string): Promise<void> {
  await mkdir(path.dirname(path.resolve(filePath)), { recursive: true });
  await writeFile(filePath, contents, 'utf8');
}

export async function readReceipt(filePath: string): Promise<Receipt> {
  const parsed = JSON.parse(await readFile(filePath, 'utf8')) as Partial<Receipt>;
  if (parsed.schemaVersion !== '1') {
    throw new Error(`${filePath} is not an envreceipt v1 receipt`);
  }
  return parsed as Receipt;
}

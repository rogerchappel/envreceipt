#!/usr/bin/env node
import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFile = promisify(execFileCallback);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = await mkdtemp(path.join(os.tmpdir(), 'envreceipt-package-smoke-'));

async function run(command, args, options = {}) {
  return execFile(command, args, {
    cwd: options.cwd ?? root,
    env: { ...process.env, npm_config_fund: 'false', npm_config_audit: 'false' },
    maxBuffer: 1024 * 1024,
  });
}

try {
  const packResult = await run('npm', ['pack', '--json', '--pack-destination', temp]);
  const [pack] = JSON.parse(packResult.stdout);
  if (!pack?.filename || !Array.isArray(pack.files)) {
    throw new Error('npm pack did not return package metadata');
  }

  const packedPaths = pack.files.map((file) => file.path);
  const leakedTestFile = packedPaths.find((file) => file.startsWith('dist/test/'));
  if (leakedTestFile) {
    throw new Error(`Packed tarball includes compiled test file: ${leakedTestFile}`);
  }
  for (const requiredPath of ['dist/src/cli.js', 'dist/src/index.js', 'README.md', 'LICENSE']) {
    if (!packedPaths.includes(requiredPath)) {
      throw new Error(`Packed tarball is missing ${requiredPath}`);
    }
  }

  const tarballPath = path.join(temp, pack.filename);
  await run('npm', ['init', '-y'], { cwd: temp });
  await run('npm', ['install', tarballPath], { cwd: temp });
  await run('npx', ['--no-install', 'envreceipt', '--help'], { cwd: temp });
  await run('npx', ['--no-install', 'envreceipt', '--version'], { cwd: temp });

  console.log(`envreceipt package smoke passed with ${pack.files.length} packed file(s).`);
} finally {
  await rm(temp, { recursive: true, force: true });
}

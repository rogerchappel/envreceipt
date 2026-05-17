import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { captureReceipt } from '../src/capture.js';

test('captureReceipt normalizes project name and hashes config files', async () => {
  const project = await mkdtemp(path.join(tmpdir(), 'envreceipt-'));
  await writeFile(path.join(project, 'package.json'), JSON.stringify({ name: 'sample', version: '1.0.0' }), 'utf8');
  await writeFile(path.join(project, 'envreceipt.config.json'), JSON.stringify({ env: { allow: ['NODE_ENV', 'API_TOKEN'], reveal: ['NODE_ENV'] } }), 'utf8');

  const receipt = await captureReceipt(project, {
    now: new Date('2026-05-17T11:00:00.000Z'),
    env: {
      NODE_ENV: 'test',
      API_TOKEN: 'super-secret'
    }
  });

  assert.equal(receipt.generatedAt, '2026-05-17T11:00:00.000Z');
  assert.equal(receipt.projectRoot, path.basename(project));
  assert.ok(receipt.configFiles.some((file) => file.path === 'package.json'));
  assert.deepEqual(receipt.env.filter((item) => item.key === 'API_TOKEN'), [
    { key: 'API_TOKEN', state: 'redacted', reason: 'secret-like key' }
  ]);
});

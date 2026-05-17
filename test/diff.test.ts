import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { diffReceipts } from '../src/diff.js';
import type { Receipt } from '../src/types.js';

test('diffReceipts compares fixtures with stable severities', async () => {
  const before = JSON.parse(await readFile('fixtures/mac-node20.json', 'utf8')) as Receipt;
  const after = JSON.parse(await readFile('fixtures/linux-node22.json', 'utf8')) as Receipt;
  const diff = diffReceipts(before, after, { comparedAt: new Date('2026-05-17T10:00:00.000Z') });

  assert.equal(diff.comparedAt, '2026-05-17T10:00:00.000Z');
  assert.equal(diff.summary.fail, 3);
  assert.ok(diff.items.some((item) => item.path === 'tools.node' && item.severity === 'fail'));
  assert.ok(diff.items.some((item) => item.path === 'os.platform' && item.severity === 'warn'));
});

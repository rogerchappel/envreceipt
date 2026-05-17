import assert from 'node:assert/strict';
import test from 'node:test';
import { parseConfig } from '../src/config.js';

test('parseConfig accepts object configs', () => {
  assert.deepEqual(parseConfig('{"env":{"allow":["FOO"]}}'), {
    env: {
      allow: ['FOO']
    }
  });
});

test('parseConfig rejects arrays', () => {
  assert.throws(() => parseConfig('[]'), /must be a JSON object/);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { redactEnv, sanitizeCommandOutput } from '../src/redact.js';

test('redactEnv hides values by default and reveals allowlisted safe keys', () => {
  const env = {
    NODE_ENV: 'test',
    USER: 'roger',
    API_TOKEN: 'secret'
  };

  assert.deepEqual(redactEnv(env, ['API_TOKEN', 'NODE_ENV', 'USER'], ['NODE_ENV']), [
    { key: 'API_TOKEN', state: 'redacted', reason: 'secret-like key' },
    { key: 'NODE_ENV', state: 'present', value: 'test' },
    { key: 'USER', state: 'redacted', reason: 'value hidden by default' }
  ]);
});

test('sanitizeCommandOutput redacts secret-like assignments', () => {
  assert.equal(sanitizeCommandOutput('token=abc123\nstatus=ok'), 'token=[REDACTED]\nstatus=ok');
});

import type { EnvVarReceipt } from './types.js';

const secretPattern = /(secret|token|password|passwd|pwd|key|credential|auth|cookie|session|private|cert)/i;

export function isSecretLikeKey(key: string): boolean {
  return secretPattern.test(key);
}

export function redactEnv(
  env: NodeJS.ProcessEnv,
  allow: string[],
  reveal: string[]
): EnvVarReceipt[] {
  const allowed = [...new Set(allow)].sort();
  const revealSet = new Set(reveal);

  return allowed.map((key) => {
    const value = env[key];
    if (value === undefined) {
      return { key, state: 'missing' };
    }

    if (isSecretLikeKey(key)) {
      return { key, state: 'redacted', reason: 'secret-like key' };
    }

    if (value.length === 0) {
      return { key, state: 'empty' };
    }

    if (revealSet.has(key)) {
      return { key, state: 'present', value };
    }

    return { key, state: 'redacted', reason: 'value hidden by default' };
  });
}

export function sanitizeCommandOutput(output: string): string {
  return output
    .split(/\r?\n/)
    .map((line) => line.replace(/(token|password|secret|key)=\S+/gi, '$1=[REDACTED]'))
    .filter(Boolean)
    .slice(0, 20)
    .join('\n');
}

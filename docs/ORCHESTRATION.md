# Orchestration

`envreceipt` is local-first and has no network behavior. The orchestration goal is to produce a small redacted artifact before a release, bug report, or failed test handoff.

## Agent Flow

1. Run `npm ci`.
2. Run `npm run check`, `npm test`, `npm run build`, and `npm run smoke`.
3. Capture the local environment with `node dist/cli.js capture . --out .envreceipt/local.json --markdown .envreceipt/local.md`.
4. Attach `.envreceipt/local.md` to human-readable handoffs and `.envreceipt/local.json` to machine-readable handoffs.
5. Compare receipts with `node dist/cli.js diff before.json after.json`.

## Privacy Rules

- Never capture arbitrary file contents.
- Hash config files with SHA-256 instead of copying content.
- Treat secret-like env keys as redacted even when configured.
- Keep extra commands narrow and deterministic.

## Release Gate

```bash
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
```

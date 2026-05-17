# PRD: envreceipt

Status: in-progress
Decision: build now
Factory run: 2026-05-17 PM

## Pitch

`envreceipt` records a redacted, reproducible local environment receipt for builds: tool versions, package manager facts, selected env keys, and config fingerprints. It answers "what machine did this pass on?" without leaking secrets. 🧾

## Why It Matters

Builds fail across machines because local versions, package managers, shells, and environment assumptions drift. Agents need a small artifact they can attach to handoffs and bug reports without copying private environment values.

## Qualification

### Pub Test

"Generate a safe environment receipt before a release or failing test run, then compare it with another machine."

### Source / Inspiration

Inspired by reproducible-build environment capture, CI debug summaries, `doctor` commands, and Roger's local-first OSS verification workflow. This is a small deterministic CLI, not a clone of any one tool.

### V1 Scope

- TypeScript CLI package.
- `envreceipt capture` records OS, shell, Node/npm/pnpm/yarn/git versions, package manager files, selected dependency metadata, git HEAD/status summary, and config file hashes.
- Conservative redaction for env values and secret-like keys.
- `envreceipt diff` compares two receipts with stable severity labels.
- Markdown and JSON output.
- Config file for allowlisted env keys, extra commands, ignored paths, and severity thresholds.
- Fixture-backed tests for redaction, capture normalization, diffing, and config.

## Out of Scope

- Full software bill of materials.
- Vulnerability scanning.
- Uploading receipts.
- Capturing arbitrary file contents.

## CLI Sketch

```bash
envreceipt capture . --out .envreceipt/local.json --markdown docs/ENVRECEIPT.md
envreceipt diff fixtures/mac-node20.json fixtures/linux-node22.json
envreceipt capture . --config envreceipt.config.json
```

## Verification

Run `npm test`, `npm run check`, `npm run build`, `npm run smoke`, `bash scripts/validate.sh`, and a real CLI smoke that captures and diffs fixture receipts.

## Agent Prompt

Build `envreceipt` as a privacy-preserving local environment receipt CLI. Make redaction obvious, diffs stable, and output useful in release and failure handoffs.


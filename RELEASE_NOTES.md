# Release candidate

Initial public build for `envreceipt` 0.1.0.

## Highlights

- Adds `capture` and `diff` CLI commands for redacted environment receipts.
- Captures project, git, package manager, command, and environment facts.
- Provides stable receipt and diff formatting for local build handoffs.
- Includes redaction defaults, fixture coverage, smoke tests, and package dry-run checks.

## Changes

- Features: Implement capture and diff CLI commands. (9af85c0)
- Features: Add receipt file IO helpers. (25b06ef)
- Features: Format receipts and diffs. (f746bc1)
- Features: Diff receipts with stable severities. (733fe3e)
- Features: Capture complete environment receipts. (487398a)
- Features: Summarize git workspace state. (3688bbf)
- Features: Capture package manager facts. (4e02817)
- Features: Collect bounded command receipts. (e2e29db)
- Fixes: Point package binary at built CLI. (4b6c48f)
- Fixes: Use real shell status in smoke script. (0ac9dfb)
- Fixes: Handle optional config arrays in core flows. (d60c36e)
- Docs: Add task and orchestration plans. (78d9845)
- Tests: Align diff fixture severity expectation. (8c21361)
- Tests: Add CLI smoke script. (6122675)
- Tests: Cover capture normalization. (63b11a7)
- Tests: Cover fixture diffs. (fbf323c)
- Tests: Cover config parsing. (9389930)
- Tests: Cover environment redaction. (ef6c0d1)
- Tests: Add cross-platform receipt fixtures. (5db846f)

## Verification

- `npm install`
- `npm run release:check`
- `node /Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js check .`
- `node /Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js notes .`

## Classification

Ship: release readiness checks pass, ReleaseBox check passes, and package dry run succeeds. npm publishing remains disabled in `releasebox.config.json`.

## Contributors

- Roger Chappel

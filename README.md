# envreceipt

Privacy-preserving environment receipts for local builds and handoffs.

## Status

This repository is early-stage. Confirm the current support, release, and
security posture before using it in production.

## Install

Install dependencies and build the CLI before running the fixture-backed smoke
checks.

```sh
npm install
npm run build
```

## Use

Capture a redacted receipt for the current repository:

```sh
node dist/src/cli.js capture . --out receipt.json --markdown receipt.md
```

Compare two saved receipts before and after an environment change:

```sh
node dist/src/cli.js diff fixtures/mac-node20.json fixtures/linux-node22.json --markdown diff.md
```

The receipt records deterministic project, git, runtime, package manager, and
selected environment facts while redacting secret-like names and values.

## Verify

Run the local validation script before opening a pull request:

```sh
bash scripts/validate.sh
```

`scripts/validate.sh` runs the repository's standard local checks when they are defined and will also run `agent-qc ready` when `agent-qc` is installed. Missing `agent-qc` is treated as a skip, not a failure.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes
should be small, reviewable, and verified before review.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance. Replace
the default security policy before publishing the generated repository.

Review generated receipts before sharing them outside the repository. Redaction
is intentionally conservative, but project-specific secret names may require
additional filtering.

## License

MIT

## Development

Run the same checks locally before opening a change:

```sh
npm ci
npm run check
npm run build
npm test
npm run smoke
npm run package:smoke
npm run release:check
```

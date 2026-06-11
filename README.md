# envreceipt

Privacy-preserving environment receipts for local builds and handoffs.

## Status

This repository is early-stage. Confirm the current support, release, and
security posture before using it in production.

## Install

Install dependencies and build the CLI before running the fixture-backed smoke checks.

```sh
pnpm install
```

## Use

Run the CLI against an environment file to produce a redacted receipt that can
be attached to a build handoff.

```sh
npm run build
node dist/src/cli.js capture . --out receipt.json --markdown receipt.md
```

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

These links assume this README has been copied to the generated repository root.

## License

MIT

## Development

```sh
git clone https://github.com/rogerchappel/undefined.git
cd undefined
npm install
npm test
npm run smoke
npm run package:smoke
npm run release:check
```

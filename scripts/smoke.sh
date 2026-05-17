#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

rm -rf .envreceipt
mkdir -p .envreceipt

node dist/cli.js capture . --out .envreceipt/local.json --markdown .envreceipt/local.md
node dist/cli.js diff fixtures/mac-node20.json fixtures/linux-node22.json --json --out .envreceipt/fixture-diff.json || status=$?

if [ "${status:-0}" -ne 2 ]; then
  echo "expected fixture diff to exit 2 because fail-level differences exist" >&2
  exit 1
fi

node -e "const fs=require('node:fs'); for (const file of ['.envreceipt/local.json','.envreceipt/local.md','.envreceipt/fixture-diff.json']) { if (!fs.existsSync(file)) throw new Error(file + ' missing'); }"

printf 'envreceipt smoke passed\n'

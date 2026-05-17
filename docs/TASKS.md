# envreceipt Tasks

## V1 MVP

- [x] Scaffold a TypeScript OSS CLI with StackForge.
- [x] Capture OS, shell, core tool versions, package manager facts, git state, env key states, and config file hashes.
- [x] Redact env values by default and always redact secret-like keys.
- [x] Load `envreceipt.config.json` for env keys, revealed safe keys, config files, extra commands, and severity rules.
- [x] Diff two receipts with deterministic severity labels.
- [x] Emit JSON and Markdown output for receipts and diffs.
- [x] Add fixture-backed tests for redaction, config parsing, capture normalization, and diffing.
- [x] Add CLI smoke coverage and validation script integration.
- [x] Document practical local usage, security posture, and contribution workflow.

## Follow-ups

- [ ] Add JSON schema files for receipts and config.
- [ ] Support `--fail-on warn|fail|never` for CI workflows.
- [ ] Add optional SARIF or GitHub step summary output.
- [ ] Add Windows fixture coverage once a Windows runner is available.

#!/usr/bin/env node
import { Command } from 'commander';
import { captureReceipt } from './capture.js';
import { loadConfig } from './config.js';
import { diffReceipts } from './diff.js';
import { formatDiffMarkdown, formatJson, formatReceiptMarkdown } from './format.js';
import { version } from './index.js';
import { readReceipt, writeTextFile } from './io.js';

const program = new Command();

program
  .name('envreceipt')
  .description('Capture and diff redacted local environment receipts.')
  .version(version);

program
  .command('capture')
  .description('Capture a redacted environment receipt for a project directory.')
  .argument('[path]', 'Project path to inspect.', '.')
  .option('--config <path>', 'Path to envreceipt.config.json.')
  .option('--out <path>', 'Write JSON receipt to this path instead of stdout.')
  .option('--markdown <path>', 'Also write a Markdown receipt.')
  .action(async (projectPath: string, options: { config?: string; out?: string; markdown?: string }) => {
    try {
      const receipt = await captureReceipt(projectPath, { config: options.config });
      const json = formatJson(receipt);
      if (options.out) {
        await writeTextFile(options.out, json);
      } else {
        process.stdout.write(json);
      }

      if (options.markdown) {
        await writeTextFile(options.markdown, formatReceiptMarkdown(receipt));
      }
    } catch (error) {
      fail(error);
    }
  });

program
  .command('diff')
  .description('Compare two envreceipt JSON files.')
  .argument('<before>', 'Earlier receipt JSON file.')
  .argument('<after>', 'Later receipt JSON file.')
  .option('--config <path>', 'Path to envreceipt.config.json for severity overrides.')
  .option('--json', 'Print JSON diff instead of Markdown.')
  .option('--out <path>', 'Write diff output to this path instead of stdout.')
  .action(async (beforePath: string, afterPath: string, options: { config?: string; json?: boolean; out?: string }) => {
    try {
      const [before, after, config] = await Promise.all([
        readReceipt(beforePath),
        readReceipt(afterPath),
        loadConfig(process.cwd(), options.config)
      ]);
      const diff = diffReceipts(before, after, { severity: config.severity });
      const output = options.json ? formatJson(diff) : formatDiffMarkdown(diff);
      if (options.out) {
        await writeTextFile(options.out, output);
      } else {
        process.stdout.write(output);
      }
      process.exitCode = diff.summary.fail > 0 ? 2 : 0;
    } catch (error) {
      fail(error);
    }
  });

program.parse();

function fail(error: unknown): void {
  const message = error instanceof Error ? error.message : 'Unknown envreceipt error';
  process.stderr.write(message + '\n');
  process.exitCode = 1;
}

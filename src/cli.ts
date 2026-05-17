#!/usr/bin/env node
import { Command } from 'commander';
import { version } from './index.js';

const program = new Command();

program
  .name('envreceipt')
  .description('Capture and diff redacted local environment receipts.')
  .version(version);

program.parse();

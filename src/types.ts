export type Severity = 'info' | 'warn' | 'fail';

export type ReceiptFormatVersion = '1';

export type EnvValueState = 'present' | 'empty' | 'redacted' | 'missing';

export type EnvVarReceipt = {
  key: string;
  state: EnvValueState;
  value?: string;
  reason?: string;
};

export type CommandReceipt = {
  name: string;
  command: string;
  ok: boolean;
  stdout?: string;
  stderr?: string;
  exitCode?: number;
};

export type FileFingerprint = {
  path: string;
  algorithm: 'sha256';
  hash: string;
  bytes: number;
};

export type PackageManagerReceipt = {
  name: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';
  lockfiles: FileFingerprint[];
  packageJson?: {
    name?: string;
    version?: string;
    packageManager?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
};

export type GitReceipt = {
  available: boolean;
  head?: string;
  branch?: string;
  dirty?: boolean;
  changedFiles?: number;
  statusSummary?: string[];
};

export type Receipt = {
  schemaVersion: ReceiptFormatVersion;
  generatedAt: string;
  projectRoot: string;
  os: {
    platform: NodeJS.Platform;
    release: string;
    arch: string;
  };
  shell?: string;
  tools: CommandReceipt[];
  packageManager: PackageManagerReceipt;
  git: GitReceipt;
  env: EnvVarReceipt[];
  configFiles: FileFingerprint[];
  extraCommands: CommandReceipt[];
};

export type DiffItem = {
  path: string;
  severity: Severity;
  before: unknown;
  after: unknown;
  message: string;
};

export type DiffResult = {
  schemaVersion: '1';
  comparedAt: string;
  before: string;
  after: string;
  items: DiffItem[];
  summary: Record<Severity, number>;
};

export type EnvreceiptConfig = {
  env?: {
    allow?: string[];
    reveal?: string[];
  };
  configFiles?: string[];
  ignorePaths?: string[];
  extraCommands?: Array<{
    name: string;
    command: string;
  }>;
  severity?: {
    fail?: string[];
    warn?: string[];
  };
};

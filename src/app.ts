import '@friends-library/env/load';
import yargs from 'yargs';
import * as branch from './cmd/branch';
import * as status from './cmd/status';
import * as checkout from './cmd/checkout';
import * as commit from './cmd/commit';
import * as push from './cmd/push';
import * as dlete from './cmd/delete';
import * as sync from './cmd/sync';
import * as clone from './cmd/clone';
import * as workflows from './cmd/workflows';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
yargs
  .scriptName(`fell`)
  .command(branch)
  .command(status)
  .command(checkout)
  .command(commit)
  // @ts-ignore
  .command(push)
  .command(sync)
  // @ts-ignore
  .command(clone)
  // @ts-ignore
  .command(dlete)
  .command(workflows)
  .help().argv;

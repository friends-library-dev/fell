import { CommandBuilder } from 'yargs';
import env from '@friends-library/env';
import * as friendRepos from '@friends-library/friend-repos';

interface Argv {
  deleteExisting: boolean;
}

export async function handler({ deleteExisting }: Argv): Promise<void> {
  const { DOCS_REPOS_ROOT } = env.require(`DOCS_REPOS_ROOT`);
  try {
    await friendRepos.cloneAll(DOCS_REPOS_ROOT, deleteExisting);
  } catch {
    process.exit(1);
  }
}

export const command = `clone`;

export const describe = `Clones down all doc repos`;

export const builder: CommandBuilder = function (yargs) {
  return yargs.option(`delete-existing`, {
    alias: `x`,
    type: `boolean`,
    description: `delete all existing repos before cloning`,
    default: false,
    demand: false,
  });
};

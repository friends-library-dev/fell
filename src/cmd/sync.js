// @flow
import { green } from '@friends-library/cli/color';
import type { Argv } from '../type';
import { getRepos, getStatusGroups } from '../repos';
import { excludable, scopeable } from './helpers';
import * as git from '../git';

export async function handler({ exclude, scope }: Argv) {
  const repos = await getRepos(exclude, scope);
  const { clean } = await getStatusGroups(repos);
  await Promise.all(clean.map(git.sync));
  green(`👍  ${clean.length} repos synced.`);
}

export const command = 'sync';

export const describe = 'like git pull --rebase';

export const builder = {
  ...excludable,
  ...scopeable,
};
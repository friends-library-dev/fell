import { log } from 'x-chalk';
import { Options } from 'yargs';
import chalk from 'chalk';
import { Argv } from '../type';
import { getRepos, getBranchMap } from '../repos';
import { excludable, relPath } from './helpers';

export async function handler({ exclude }: Argv): Promise<void> {
  const repos = await getRepos(exclude);
  const branchMap = await getBranchMap(repos);
  [...branchMap].forEach(([branch, branchRepos]) => {
    log(`${branchRepos.length} repos on branch ${chalk.green(`<${branch}>`)}`);
    if (branch !== `master`) {
      branchRepos.forEach((repo) => {
        log(`  ${chalk.grey(`↳`)} ${chalk.yellow(relPath(repo))}`);
      });
    }
  });
}

export const command = [`branch`, `br`];

export const describe = `Reports the current <HEAD> branch for all repos`;

export const builder: { [key: string]: Options } = excludable;

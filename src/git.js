// @flow
/* istanbul ignore file */
import NodeGit from 'nodegit';
import type { Repo } from './type';

export async function getCurrentBranch(repoPath: Repo): Promise<string> {
  const repo = await getRepo(repoPath);
  const ref = await repo.getCurrentBranch();
  return ref.shorthand();
}

export async function isStatusClean(repoPath: Repo): Promise<boolean> {
  const repo = await getRepo(repoPath);
  const statusFiles = await repo.getStatus();
  return statusFiles.length === 0;
}

export async function hasBranch(
  repoPath: Repo,
  branchName: string,
): Promise<boolean> {
  const repo = await getRepo(repoPath);
  try {
    await repo.getBranch(branchName);
    return true;
  } catch (e) {
    return false;
  }
}

export async function deleteBranch(
  repoPath: Repo,
  branch: string,
): Promise<boolean> {
  const repo = await getRepo(repoPath);
  const ref = await repo.getBranch(branch);
  const res = await NodeGit.Branch.delete(ref);
  return res === 0;
}

export async function sync(repoPath: Repo): Promise<void> {
  const branch = await getCurrentBranch(repoPath);
  const repo = await getRepo(repoPath);
  await repo.fetchAll({ ...remoteCallbacks });
  await repo.mergeBranches(
    branch,
    'origin/master',
    repo.defaultSignature(),
    NodeGit.Merge.PREFERENCE.FASTFORWARD_ONLY,
  );
}

export async function clone(
  repoPath: Repo,
  url: string,
): Promise<NodeGit.Repository> {
  const opts = { fetchOpts: remoteCallbacks };
  return NodeGit.Clone(url, repoPath, opts);
}

// like `git add . && git commit -am <message>`
export async function commitAll(
  repoPath: Repo,
  message: string,
): Promise<void> {
  const repo = await getRepo(repoPath);
  // @see https://github.com/nodegit/nodegit/blob/master/examples/add-and-commit.js
  const signature = repo.defaultSignature();
  const index = await repo.refreshIndex();
  await index.addAll();
  await index.write();
  const oid = await index.writeTree();
  const head = await NodeGit.Reference.nameToId(repo, 'HEAD');
  const parent = await repo.getCommit(head);
  return repo.createCommit(
    'HEAD',
    signature,
    signature,
    message,
    oid,
    [parent],
  );
}

export async function push(
  repoPath: Repo,
  branch: string,
  force?: boolean = false,
  remoteName?: string = 'origin',
): Promise<void> {
  const repo = await getRepo(repoPath);
  const remote = await repo.getRemote(remoteName);
  await remote.push(
    [`${force ? '+' : ''}refs/heads/${branch}:refs/heads/${branch}`],
    remoteCallbacks,
  );
}

const remoteCallbacks = {
  callbacks: {
    certificateCheck() {
      return 0;
    },
    credentials(url, userName) {
      return NodeGit.Cred.sshKeyFromAgent(userName);
    },
  },
};

export async function isAheadOfMaster(
  repoPath: Repo,
): Promise<boolean> {
  const repo = await getRepo(repoPath);
  const headCommit = await repo.getHeadCommit();
  const masterCommit = await repo.getMasterCommit();
  if (headCommit.sha() === masterCommit.sha()) {
    return false;
  }

  const priorShas = await new Promise(resolve => {
    const stream = masterCommit.history();
    stream.on('end', commits => resolve(commits.map(commit => commit.sha())));
    stream.start();
  });

  return priorShas.includes(masterCommit.sha());
}

export async function getHeadCommitMessage(
  repoPath: Repo,
): Promise<string> {
  const repo = await getRepo(repoPath);
  const headCommit = await repo.getHeadCommit();
  return headCommit.message();
}

export async function checkoutBranch(
  repoPath: Repo,
  branchName: string,
): Promise<void> {
  const repo = await getRepo(repoPath);
  await repo.checkoutBranch(branchName);
}

export async function checkoutNewBranch(
  repoPath: Repo,
  branchName: string,
): Promise<void> {
  const repo = await getRepo(repoPath);
  const commit = await repo.getHeadCommit();
  await repo.createBranch(branchName, commit, false);
  await repo.checkoutBranch(branchName);
}


async function getRepo(repoPath: Repo) {
  return NodeGit.Repository.open(repoPath);
}
import { execSync } from 'node:child_process';

export const previewBranches = [
  'preview',
  'feat/pages-content-collection',
];

function getGitBranch() {
  const branch = execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf-8',
  }).trim();
  return branch;
}

export const isPreview = previewBranches.includes(
  process.env.CF_PAGES_BRANCH || getGitBranch(),
);

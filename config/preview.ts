import { execSync } from 'node:child_process';

export const previewBranches = ['preview', 'feat/preview-mode', 'fix/function-size', 'fix/preview-mode-routing', 'preview-throws-500-due-to-Astro-bug-in-server-mode', 'fix/previews-not-working'];

function getGitBranch() {
  const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  return branch;
}

export const isPreview = previewBranches.includes(process.env.CF_PAGES_BRANCH || getGitBranch());

# DatoCMS environment configuration file

**Use static configuration file to define DatoCMS environment to support setting environment per deploy preview (git commit/branch)**

- Date: 2023-10-24
- Alternatives Considered: use env variables; base DatoCMS environment name on git brach name.
- Decision Made By: [Declan](https://github.com/decrek), [Jasper](https://github.com/jbmoelker)

## Decision

To [Match Cloudflare previews with DatoCMS environments](https://github.com/voorhoede/head-start/issues/11) we've tried different approaches, including [basing the DatoCMS environment on a git branch name](https://github.com/voorhoede/head-start/pull/14), [using a static config file to define the DatoCMS environment](https://github.com/voorhoede/head-start/pull/26) and [using environment variables](https://github.com/voorhoede/head-start/issues/106#issuecomment-1880786546).

- We need to be able to differentiate `datocmsEnviroment` between branch deploys, so that PR previews can use a DatoCMS sandbox environment. Unfortunately we can't set an env variable per branch in Cloudflare Pages (unlike Netlify and Vercel can since recently). And when a PR is merged that sandbox environment should also be promoted to the main DatoCMS environment. The `main` branch is now automatically connected to the right DatoCMS environment on merge. We can solve this by automating migrations on merge. But that's also still blocked by #62 .
- Cloudlfare checks out a single commit and not a branch, so it is hard to get the branch name. We can use an Cloudlfare specific env variable but then we would create something Cloudlfare specific and we would need to normalise it during development. There are packages that normalise those env variables so It can be done but it complicates things.
I had my doubt about using branch names already, especially with the non supporting characters, but if we look at a developer workflow: After reviewing a PR with a environment attached to it, you would create a new fork of the primary environment and run the migration script on the up to date content. Since you can not rename environments its hard to keep the branch name and environment in sync, since there probably was already an outdated environment with the name of the branch.

All of the above vs a single JS file with an export of the active environment. It works on PR branches at when you merge to main it will still work since you promote the environment of your feature branch to the primary one. So we decided to use this simpler option.

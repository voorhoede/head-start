# Upgrading

Head Start is a boilerplate meant as a starting point to adjust to a project's needs. It is not a package meant to be used as a dependency. As such, Head Start has no formal releases or versioning.

Did you start your project using Head Start as its template? You can still apply new changes made to Head Start since to your own project. This can be done in 2 steps:

1. Find the change(s) you want to apply
2. Apply the change(s) to your project

## Find the changes

Since Head Start doesn't have formal versioning, the best changelog is the [list of changes (commits) on the `main` branch](https://github.com/voorhoede/head-start/commits/main/) on GitHub or from the command line in the repository (`git log main --oneline`):

```bash
6790dba feature: upgrade Astro to v5 beta (#189)
39298c5 feature: Remove background image when image is loaded (#185)
822a3a2 test: Link Node, no trailing whitespace (#186)
3be3ebf fix: redirects middleware (#184)
23c2ec3 fix: params.locale fallback on [locale]/ route mismatch (#183)
ae9b5ee chore: component testing (#177)
83a8b70 feature: LocaleSelector, use localised language names (#182)
035a205 fix 404: dynamic 404.astro route to render "not found" page  (#180)
dee8dc3 feat/unit-testing (#169)
15eb066 Fix: Astro imports in typescript (#176)
```

Head Start uses a squash-and-merge strategy for pull requests. So the list should read like a clear list of changes. When you've found the change(s) you want to apply to your project, you can continue. The best way to proceed depends on if you want to [apply a single change](#apply-single-change) or [apply a range of changes](#apply-range-of-changes).

## Apply single change

If you only need a single change, you can use a commit's patch file. For example if you select the commit ["feature: upgrade Astro to v5 beta" (`a622bd`)](https://github.com/voorhoede/head-start/commit/a622bd), you can add `.patch` to the URL to get its patch file: [`https://github.com/voorhoede/head-start/commit/a622bd.patch`](https://github.com/voorhoede/head-start/commit/a622bd.patch). Then you can apply the patch to your project from its repository:

```bash
curl https://github.com/voorhoede/head-start/commit/a622bd.patch | git am
```

Alternatively you can add Head Start as a secondary remote to your project's repository and use cherry picking to apply the change:

```bash
git remote add head-start git@github.com:voorhoede/head-start.git
git remote update

# git cherry-pick commitSha
git cherry-pick a622bd
```

That's it. The original commit for the change is now applied to your project.

## Apply range of changes

If you want to apply a range of changes from Head Start to your own project, applying patches as described above is not an option. Instead you can use cherry picking for an entire range. For example when you want to apply all the changes made to Head Start after you've used it as a template for your own project. Note the commit SHA of the first and the last change of your range. Then add Head Start as a secondary remote to your project's repository and use cherry picking to apply the range of changes:

```bash
git remote add head-start git@github.com:voorhoede/head-start.git
git remote update

# git cherry-pick --strategy recursive --strategy-option theirs oldestCommitSha^..latestCommitSha
git cherry-pick --strategy recursive --strategy-option theirs 035a205^..a622bd
```

If you encounter any merge conflicts along the way, resolve them as you normally do, then continue the cherry picking process:

```bash
git cherry-pick --continue
```

That's it. The original commits for the entire range of changes is now applied to your project.

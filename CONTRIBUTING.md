# Contributing

## Setup

```bash
nvm install && nvm use
npm install
```

## Workflow

1. Branch from `main`.
2. Make changes. Hooks run staged checks on commit and the full suite on push;
   never bypass them.
3. Use a commit subject of at least 15 characters.
4. If the PR changes application code, `package.json`, or `tsconfig.json`,
   update `CHANGELOG.md` and bump the version in `package.json` once.
5. Open a draft PR that references its GitHub issue with `Closes #<issue>`.

## Standards

- Strict ESLint, Stylelint, html-validate, and markdownlint must pass.
- Test coverage must be 100% for statements, branches, functions, and lines.
  It is enforced on push and in CI. Do not lower the thresholds.
- UI changes use `/design-system` tokens and components.
- See [AGENT.md](./AGENT.md) for the full rule list.

## Release policy

The release gate runs when a PR changes application code, `package.json`, or
`tsconfig.json`. It requires a SemVer increase and a non-empty matching
section in `CHANGELOG.md`. Documentation, tests, workflows, and tooling-only
PRs do not require a version bump. Tagged releases (`vX.Y.Z`) must match
`package.json` and have non-empty notes extracted from the changelog.

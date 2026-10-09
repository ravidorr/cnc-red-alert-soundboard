# C&C Red Alert Soundboard - Agent Guide

Canonical instructions for AI coding agents. `CLAUDE.md` and `GEMINI.md` point here; edit this file only.

## Project

Command & Conquer Red Alert Soundboard PWA with 190 classic sound effects and an accessible Red Alert-themed interface.

## Commands

- Install: `npm install`
- Lint: `npm run lint`
- Test: `npm run test`
- Coverage: `npm run test:coverage` (100% lines, functions, branches, statements; mandatory on push and in CI)
- Build: `npm run build`

## Rules

- Never commit with `--no-verify`. Fix the cause when a hook fails.
- This repository uses GitHub issues for ticketing.
- Open pull requests as drafts and reference the related GitHub issue with
  `Closes #<issue>`.
- Linters are strict (ESLint, Stylelint, html-validate, markdownlint). Do not weaken rules to pass.
- UI work uses the tokens and components in `/design-system`. No hard-coded colors or spacing.
- Pin Node via `.nvmrc`; package manager is `npm`. Keep the lockfile committed.
- PRs that change application code, `package.json`, or `tsconfig.json` update `CHANGELOG.md` and bump the version (one SemVer bump per PR). Docs-only, test-only, and tooling-only PRs do not.
- Track open work in `TODO.md`.

## Layout

- `design-system/` - tokens, components, showcase
- `.husky/` - git hooks (pre-commit fast, pre-push broad)
- `.github/` - CI, release, Dependabot, templates

---
name: splitupi-release
description: SplitUPI finishing-touch release track. Use ONLY when shipping SplitUPI work: feat/su-* branches, short commits, human PR text, green checks, semver tags vX.Y.Z, GitHub releases.
---

# SplitUPI release track

Follow this exact track for every SplitUPI push. No shortcuts, no going rogue.

## 1. Branch

- Format: `feat/su-<short-name>` (e.g. `feat/su-dark-theme`)
- Branch from `main`, one concern per branch.

## 2. Commit

- Short, plain commit messages. Examples:
  - `Add dark theme toggle`
  - `Fix QR download on mobile Safari`
- Never commit `node_modules/`, `dist/`, `.env`, or secrets.

## 3. Push + PR

- Push to the branch, open a PR against `main` with `gh`.
- PR title short, body 3–6 plain lines: what changed, how to check.
- Must sound human-written. No AI boilerplate, no emoji spam, no "leverage".

## 4. Green checks, then merge

- Wait for the CI workflow (`test:logic` + `build`) to pass.
- For app changes, open the Vercel preview link and confirm it loads.
- Only then merge (squash via `gh pr merge --squash`, delete branch).

## 5. Version tag

- Semver `vX.Y.Z`: patch = fixes, minor = features, major = breaking.
- Tag on `main` after merge: `git tag v1.1.0 && git push origin v1.1.0`
- Bump `version` in `package.json` in the same release.

## 6. Release

- `gh release create vX.Y.Z --title "vX.Y.Z" --notes "<2-4 short lines>"`
- Notes: what changed + how to verify. Attach APK/AAB files when mobile builds exist.

## Rules

- Phase-wise work: one version = one phase. Never bundle UI revamp + mobile + tests into one release.
- Infra-only changes (`.opencode/`, CI config) ride along, no version bump needed.

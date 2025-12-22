# Branching Strategy

This document defines the branch model for production, staging, and development,
and a lightweight workflow for a solo maintainer.

## Branches

- `main`: production (prod). Always stable and deployable.
- `staging`: pre-production. Mirrors what will go to prod after validation.
- `develop`: active development. Integration branch for features and fixes.

## Environments mapping

- prod -> `main`
- staging -> `staging`
- dev -> `develop`

## Solo workflow (recommended)

1. Start from `develop`:

```bash
git checkout develop
git pull origin develop
```

1. Create a short-lived feature branch:

```bash
git checkout -b feat/<topic>
```

1. Commit locally and push:

```bash
git push -u origin feat/<topic>
```

1. Merge to `develop`:

```bash
git checkout develop
git pull origin develop
git merge feat/<topic>
git push origin develop
```

1. Promote to staging:

```bash
git checkout staging
git pull origin staging
git merge develop
git push origin staging
```

1. Promote to prod:

```bash
git checkout main
git pull origin main
git merge staging
git push origin main
```

1. Delete feature branch:

```bash
git branch -d feat/<topic>
git push origin --delete feat/<topic>
```

## Hotfix flow (prod emergency)

1. Create from `main`:

```bash
git checkout main
git pull origin main
git checkout -b hotfix/<topic>
```

1. Commit, then merge back:

```bash
git checkout main
git merge hotfix/<topic>
git push origin main
```

1. Backport to `staging` and `develop`:

```bash
git checkout staging
git merge main
git push origin staging

git checkout develop
git merge main
git push origin develop
```

1. Delete hotfix branch:

```bash
git branch -d hotfix/<topic>
git push origin --delete hotfix/<topic>
```

## Naming conventions

- Features: `feat/<short-topic>`
- Fixes: `fix/<short-topic>`
- Hotfixes: `hotfix/<short-topic>`
- Chores: `chore/<short-topic>`

## Notes

- Keep `main` protected from direct development; only merges from `staging`.
- `staging` should track what is expected to go live next.
- `develop` can be unstable during active development.

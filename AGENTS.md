# Yarn EPR — Production Management System

> Textile plant production management. Stack: Python + React + TypeScript + PostgreSQL (planned).

## Python workspace

- Use `uv` exclusively: `uv sync --locked` to provision, `uv run --locked python <file>` to run.
- Python 3.13 — pinned via `.python-version` and `pyproject.toml` `requires-python`.
- Dependencies: `openpyxl>=3.1.5`, `pandas>=3.0.3` only. Keep `uv.lock` synced with changes.
- **No Python test framework, linter, or type checker installed.** Do not claim or enforce one.
- `main.py` is a scaffold entrypoint, not production code.

## Frontend workspace

- `frontend/` is a Vite + React 19 + Mantine 9 + TypeScript project. Uses **pnpm**.
- Commands (run from `frontend/`):
  - `pnpm dev` — dev server
  - `pnpm build` — `tsc -b && vite build` (type-check + bundle)
  - `pnpm lint` — ESLint (flat config, TypeScript + React hooks rules)
  - `pnpm preview` — preview production build
- **No frontend test framework installed.** Do not claim one.
- Feature stubs: `auth`, `warehouse`, `spinning`, `lots`, `reports`, `admin`, `profile`, `not-found`.

## Architecture

- **DDD** with **Hexagonal Architecture** per bounded context.
- **Bounded contexts**: `warehouse`, `yarn-spinning`, `lot-processing`, `access-control`, `shared-reference-data`.
- `docs/architecture/` — context boundaries, ownership decisions, backend/frontend/stack design.
- `docs/domain/` — ubiquitous language naming contract (canonical English + code terms).
- `docs/db/` — one DBML schema per bounded context with dictionary files. **No actual database exists yet.**
- `docs/prd/` — PRDs are the source of truth for business meaning and rules.
- `docs/plan/` — delivery schedule (3 milestones, ~10 weeks) and spec roadmap for Phase 2.

## Backend structure — what actually exists vs. what is planned

| Path | State |
|------|-------|
| `backend/auth/domain/` | Domain code exists **with broken imports**: imports `UserId` from `shared.domain.user` which does not exist (directory is empty). |
| `backend/shared/domain/yarn_count/` | Two files, outdated vs current DBML. |
| `backend/shared/domain/user/` | Empty directory. |
| `backend/shared/domain/machine/` | Empty. |
| `backend/shared/domain/section/` | Empty. |
| `backend/shared/base/` | Empty. |
| `backend/warehouse/` | Empty placeholder (intended for Warehouse context). |
| `backend/operation/` | Empty placeholder (will become `yarn-production` + `batch-processing`). |
| `pyproject.toml` | No web framework dependency declared — FastAPI is aspirational. |

**No routes, no FastAPI app, no database adapter, no migrations exist.** The project is in early domain-modeling phase.

## Git / PR workflow

See `docs/dev-guide/git-workflow.md` for full rules. TL;DR:

- Branch format: `<layer>/<short-topic>` where layer is `back/`, `front/`, `devops/`, or `docs/`.
- Conventional Commits: `type(scope): description` — imperative mood, max 200 chars, no period.
- Squash merge to `main`, one concern per PR.
- Rebase, never merge main into feature branches.

## Conventions

- Python naming: `snake_case` for files/functions/variables, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
- DB columns: `snake_case`, singular; technical IDs end in `_id`, visible codes end in `_code`.
- Full naming rules: `docs/dev-guide/naming-conventions.md`.

## SDD (Spec-Driven Development)

- Used for structured changes via OpenCode SDD.
- SDD artifacts live in `openspec/changes/<change-name>/` (proposal → spec → design → tasks).
- First change: `raw-bale-receipt` — Warehouse raw-material bale receipt capability.
- When creating spec artifacts, trust source precedence: PRDs → architecture decisions → ubiquitous language → DBML.

## Gentle AI receipts

Gentle AI stores review receipts in `.git/gentle-ai/review-transactions/`. A stale receipt in `reviewing` state can block `git push`. If push is blocked, delete the specific receipt lineage or the entire directory:

```bash
rm -rf .git/gentle-ai/review-transactions/v2/<lineage-id>/
```

Receipts are not per-branch — they track tree hashes.

## What does NOT exist (anything not listed above)

No CI, pre-commit hooks, task runner, code generator, OpenCode config (`opencode.json`), `.opencode/` directory, GitHub templates, or test framework for either Python or frontend. Do not claim or enforce conventions that lack tooling.

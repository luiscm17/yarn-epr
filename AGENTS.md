# Yarn EPR Agent Guide

Textile production-management monorepo. Product and architecture documents currently carry more business truth than the implementation.

## Workspaces and commands

- Root Python workspace: Python 3.13 (`.python-version`), managed only with `uv`; `backend/` is a workspace member.
- Provision exactly from the lockfile with `uv sync --locked`. Keep `uv.lock` synchronized with either `pyproject.toml`.
- Root package dependencies are `openpyxl>=3.1.5` and `pandas>=3.0.3`; the `backend` member depends on `fastapi[standard]>=0.138.1`.
- `uv run --locked python main.py` and `uv run --locked --package backend python backend/main.py` only print scaffold messages. There is no ASGI application or API route yet.
- No Python test runner, linter, formatter, or type checker is configured. Do not invent commands or claim those checks passed.
- Frontend commands run from `frontend/` with `pnpm`: `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm preview`.
- `pnpm build` runs `tsc -b && vite build`; `pnpm lint` runs ESLint over the workspace. No frontend test runner is configured.
- `frontend/pnpm-workspace.yaml` enforces a 24-hour package release age and no-downgrade trust policy, with explicit exclusions. Preserve those supply-chain settings.

## Package boundaries and entrypoints

- `backend/shared/domain/user/` is implemented as a package facade (`__init__.py`) over the entity, events, and value objects. Import its public API from `shared.domain.user`, not internal files.
- Backend production contexts are still largely unimplemented; do not infer routes, persistence, migrations, or database behavior from design documents.
- Frontend bootstrap is `frontend/src/main.tsx`; it installs Mantine, notifications, and `AuthProvider`, then renders `App` and the browser router.
- Frontend code is feature-oriented under `frontend/src/features/`; `frontend/src/app/` owns shell, navigation, and routing. Use the configured `@/*` alias for `frontend/src/*`.
- Most frontend routes are placeholders, but `/warehouse/reception` has concrete form/grid code. Do not describe the entire frontend as stubs.

## Domain and architecture constraints

- PRDs in `docs/prd/` are authoritative for business meaning and rules. Then consult `docs/architecture/`, `docs/domain/ubiquitous-language.md`, and finally `docs/db/` for technical detail; DBML is design only, not evidence of a live database.
- Keep these bounded contexts distinct: Warehouse, Yarn Spinning, Lot Processing, Access Control, and Shared Reference Data. DDD with hexagonal dependency direction is the target architecture.
- Code-facing aliases are `warehouse`, `yarn-production`, `batch-processing`, `access`, and `catalogs`; do not create a generic `operation` context or use `shared` as a business-context dumping ground.
- Warehouse receives raw material as bales and later defines the single production identity. Yarn Spinning has no lot aggregate or lot timeline; Lot Processing owns stage history after Inventory assembles the lot.
- Access Control owns configurable authorization policy, not workflow meaning. Keep quality state, warehouse disposition, and physical presentation as separate concepts.
- Frontend validation is advisory; backend policy and domain decisions remain authoritative.

## Repository conventions

- Follow `docs/dev-guide/naming-conventions.md`; notably, Python package names use `snake_case`, React component files use `PascalCase.tsx`, DB tables are plural `snake_case`, and DB columns are singular `snake_case`.
- Follow `docs/dev-guide/git-workflow.md`: branches are `<layer>/<short-topic>` using `front/`, `back/`, `devops/`, or `docs/`; commits use Conventional Commits; rebase on `main`; squash merge one concern per PR.
- Structured changes live in `openspec/changes/<change-name>/`. Treat proposal, spec, design, and tasks as planning artifacts, not proof that implementation exists or is authorized.
- No versioned CI, pre-commit configuration, task runner, code generator, repository-local OpenCode configuration, or GitHub templates exist. Do not impose absent tooling.

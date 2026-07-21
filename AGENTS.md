# Yarn EPR Agent Guide

Textile production-management monorepo. PRDs and architecture documents still contain more business scope than the implementation.

## Python workspace

- Python 3.13 is pinned by `.python-version`; use `uv` from the repository root. `backend/` is a workspace member, and `uv sync --locked` provisions the lockfile exactly.
- Root dependencies are `openpyxl>=3.1.5`, `pandas>=3.0.3`, and `sqlalchemy>=2.0.51`; the `backend` member depends on `fastapi[standard]>=0.138.1`. Keep `uv.lock` synchronized with both manifests.
- Backend uses setuptools `src` layout. `backend/pyproject.toml` discovers only `warehouse*` and `operation*`; run through the root uv environment so the editable workspace install resolves `warehouse` imports.
- Run all backend tests: `uv run --locked python -m unittest discover -s backend/tests -v`.
- Run one test module: `uv run --locked python -m unittest backend.tests.test_warehouse.domain.test_raw_material_bale -v`.
- Focus a class or method by appending its dotted name, for example `...test_raw_material_bale.TestRawMaterialBale` or `...TestRawMaterialBale.test_delivered_changes_status`.
- Persistence tests use in-memory SQLite: `uv run --locked python -m unittest backend.tests.test_warehouse.adapters.persistence.test_raw_material_bale_repository -v`. PostgreSQL constraint diagnostics, timezone round-trips, and arbitrary `Decimal` round-trips are not integration-tested.
- Tests use stdlib `unittest`; no pytest, Python linter, formatter, type checker, or coverage tool is configured.
- `uv run --locked python main.py` and `uv run --locked --package backend python backend/main.py` remain print-only scaffolds. FastAPI is installed, but there is no ASGI app or route.

## Frontend workspace

- Run frontend commands from `frontend/`: `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm build`, `pnpm lint`, and `pnpm preview`.
- `pnpm build` is the typecheck plus production build (`tsc -b && vite build`); `pnpm lint` runs ESLint. No frontend test script or test framework is configured.
- Preserve `pnpm-workspace.yaml` supply-chain policy: 24-hour minimum release age and no-downgrade trust, including its explicit exclusions.
- `src/main.tsx` installs Mantine, notifications, and `AuthProvider`; `src/app/` owns shell/routing and `src/features/` owns feature code. Use the configured `@/*` alias for `src/*`.
- Most routes share placeholder pages; `/warehouse/reception` has concrete form/grid behavior and no frontend tests.

## Backend boundaries

- Import the Warehouse domain public API from `warehouse.domain` or its subpackage facades. `warehouse.domain.models` exports both `RawMaterialBale` and `RawMaterialReception`, but `warehouse.domain` and top-level `warehouse` currently export only `RawMaterialBale`.
- `warehouse.application` is the public facade for reception inputs, result, use case, and application errors. `warehouse.ports` exposes repository, identity, transaction, and transaction-conflict contracts; keep SQLAlchemy details in adapters.
- `warehouse.adapters.persistence` contains concrete SQLAlchemy records, mappers, repositories, and transaction handling, but its `__init__.py` exports nothing. The application performs canonical bale-number checks inside the transaction; the named database unique constraint closes the concurrent-write race and is translated to the application error.
- Persistence is library code, not a deployed database layer: there is no session factory, database URL/configuration, migration setup, ASGI app, or route. Adapter tests create their own SQLite engine; planning documents and DBML do not prove runtime behavior.
- `backend/src/operation/` is an empty legacy package; do not treat its presence as evidence for a generic Operation bounded context.

## Business truth

- Resolve business meaning from `docs/prd/` first, then `docs/architecture/`, `docs/domain/ubiquitous-language.md`, and finally `docs/db/` for design detail.
- Keep Warehouse, Yarn Spinning, Lot Processing, Access Control, and Shared Reference Data distinct. Target code aliases are `warehouse`, `yarn-production`, `batch-processing`, `access`, and `catalogs`; `shared` is not a business context.
- Warehouse receives bales and later defines the single production identity. Yarn Spinning owns no lot timeline; Lot Processing owns stage history after Inventory assembles the lot.
- Access Control owns configurable authorization policy, not workflow meaning. Keep Lot Processing quality, Warehouse disposition, and physical presentation separate.
- Frontend validation is advisory; backend policy and domain decisions are authoritative.

## Repository rules

- Follow `docs/dev-guide/naming-conventions.md`: Python packages/files are `snake_case`, React component files are `PascalCase.tsx`, DB tables are plural `snake_case`, and DB columns are singular `snake_case`.
- Follow `docs/dev-guide/git-workflow.md`: branches use `<layer>/<short-topic>` with `front/`, `back/`, `devops/`, or `docs/`; commits are Conventional Commits; rebase on `main`; squash-merge one concern per PR.
- Treat `openspec/changes/<change-name>/` as planning artifacts, not proof of implementation or authorization.
- No versioned CI, pre-commit config, task runner, code generator, root/repo-local OpenCode config, or GitHub templates exist. `frontend/.agents/` contains vendored frontend skills, not project task commands.

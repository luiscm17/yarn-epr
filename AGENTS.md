# Yarn EPR Agent Guide

Textile production-management monorepo. PRDs and architecture documents still contain more business scope than the implementation.

## Python workspace

- Python 3.13 is pinned by `.python-version`; use `uv` from the repository root. `backend/` is a workspace member, and `uv sync --locked` provisions the lockfile exactly.
- Root owns `openpyxl`, `pandas`, and `sqlalchemy`; the `backend` member owns FastAPI, Psycopg, and SQLAlchemy. Keep `uv.lock` synchronized with both manifests rather than adding backend-only dependencies at the root.
- Backend uses setuptools `src` layout and discovers only `warehouse*`, `infra*`, and `bootstrap*`; run through the root uv environment so editable workspace imports resolve.
- Run all backend unit tests: `uv run --locked python -m unittest discover -s backend/tests -v` (currently 106 tests).
- Run one test module: `uv run --locked python -m unittest backend.tests.test_warehouse.domain.test_raw_material_bale -v`.
- Focus a class or method by appending its dotted name, for example `...test_raw_material_bale.TestRawMaterialBale` or `...TestRawMaterialBale.test_delivered_changes_status`.
- SQLite adapter tests belong to the unit suite; do not treat them as proof of PostgreSQL constraint diagnostics, migration shape, timezone, or `Decimal` round-trips.
- Tests use stdlib `unittest`; no pytest, Python linter, formatter, type checker, or coverage tool is configured.
- `uv run --locked python main.py` and `uv run --locked --package backend python backend/main.py` remain print-only scaffolds. FastAPI is installed, but there is no ASGI app or route.

## Database and integration tests

- Schema changes are imperative Supabase migrations under `supabase/migrations/`; there is no Alembic setup. Create migration filenames with the Supabase CLI rather than inventing timestamps.
- Local database provisioning requires the Supabase CLI plus a Docker-compatible runtime. From the repository root run `supabase start`, then `supabase db reset --local --no-seed`; `--no-seed` is required because `supabase/config.toml` names `supabase/seed.sql`, which does not exist.
- PostgreSQL integration tests deliberately accept only `postgresql+psycopg` URLs on loopback port `54322`, database `postgres`. Run them after migration with `TEST_DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:54322/postgres uv run --locked python -m unittest discover -s backend/integration_tests -v`.
- Use `supabase migration list --local` to inspect local migration state. The Supabase CLI is not declared or vendored by this repository; do not assume it is installed.

## Frontend workspace

- Run frontend commands from `frontend/`: `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm build`, `pnpm lint`, and `pnpm preview`.
- `pnpm build` is the typecheck plus production build (`tsc -b && vite build`); `pnpm lint` runs ESLint. No frontend test script or test framework is configured.
- Preserve `pnpm-workspace.yaml` supply-chain policy: 24-hour minimum release age and no-downgrade trust, including its explicit exclusions.
- `src/main.tsx` installs Mantine, notifications, and `AuthProvider`; `src/app/` owns shell/routing and `src/features/` owns feature code. Use the configured `@/*` alias for `src/*`.
- Most routes share placeholder pages; `/warehouse/reception` has concrete form/grid behavior and no frontend tests.

## Backend boundaries

- `warehouse.application` is the public facade for reception inputs, result, use case, and application errors. `warehouse.ports` exposes repository, identity, transaction, and transaction-conflict contracts; keep SQLAlchemy details in adapters.
- `infra.persistence` owns `DATABASE_URL` settings, engine/session factories, and the shared SQLAlchemy registry; it is library wiring, not an application bootstrap. Package `__init__.py` files export nothing, and no deployed API currently assembles these components.
- Reception registration canonicalizes and rejects duplicate bale numbers before persistence, then inserts the reception before bales in one transaction. Commit/flush integrity failures are rolled back and only the two named constraints are translated to application conflicts; unknown integrity failures propagate.
- Shipment numbers are globally unique. Bale numbers are unique only within a reception, via `uq_raw_material_bales_reception_bale_number`; the same canonical bale number is valid in different receptions.
- Keep ORM records and the tracked migration aligned. The migration also enables RLS and revokes direct access from `anon`, `authenticated`, and `service_role`; it defines no policies, API endpoint, or runtime authorization flow.

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
- No versioned CI, pre-commit config, task runner, Python quality configuration, code generator, repo-local OpenCode config, or GitHub templates exist. Root `.agents/` and `frontend/.agents/` contain agent skills, not project task commands.

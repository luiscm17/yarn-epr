# Architecture Overview

> **System:** Textile Production Management System
> **Stack:** FastAPI + React + Supabase (see [ADR-001](adr-stack.md))

---

## 1. Architectural Style

**Layered Architecture with Service Layer pattern**, borrowing concepts from
Hexagonal Architecture and Domain-Driven Design without strict formalism.
The goal is maintainability and testability for a small team.

### Core Principle

```
Router (HTTP) → Service (business logic) → Repository (data access) → Model (database)
```

Each layer has a single responsibility and communicates only with the adjacent layer.

---

## 2. Layer Responsibilities

### 2.1 Router Layer (`app/routers/`)

- Handles HTTP concerns: path parameters, query strings, status codes
- Validates input via Pydantic schemas
- Delegates to services — **never calls the database directly**
- Returns responses using Pydantic `response_model`

**Must not contain:** business logic, database queries, complex conditionals.

### 2.2 Service Layer (`app/services/`)

- Contains **all business logic**
- Validates business rules (uniqueness, state transitions, permissions)
- Orchestrates multiple repository calls when needed
- Is HTTP-agnostic — receives and returns plain data (dicts, models, schemas)

**Must not contain:** HTTP imports (`Request`, `Response`, `status`), direct database queries.

### 2.3 Repository Layer (`app/repositories/`)

- Encapsulates database queries using SQLAlchemy
- Provides a stable interface for services — services call `repo.create(data)` not `db.query()`
- Returns model instances or `None`

**Must not contain:** business logic, HTTP exceptions (services raise those).

### 2.4 Model Layer (`app/models/`)

- SQLAlchemy ORM models defining table structure and relationships
- Anemic models — describe data, not behavior

### 2.5 Schema Layer (`app/schemas/`)

- Pydantic models for request validation and response serialization
- Define the API contract explicitly

### 2.6 Dependency Layer (`app/dependencies/`)

- Shared middleware: authentication, authorization, pagination, database sessions

---

## 3. Request Flow

```
Client ──HTTP──▶ Router ──schema──▶ Service ──data──▶ Repository ──query──▶ Database
                    ▲                   │                    │
                    │                   ▼                    │
                    │              Business Rules            │
                    │              Validation                │
                    └───────────────────────────────────────┘
                           Response (Pydantic schema)
```

### Example: Create a Section

```
POST /sections  {"name": "Preparación"}
         │
         ▼
  router/sections.py
    - Validates request body with SectionCreate schema
    - Calls section_service.create(data)
         │
         ▼
  service/section_service.py
    - Checks: does a section with this name already exist?
    - If yes → raises HTTPException(409)
    - If no  → calls section_repository.create(name)
         │
         ▼
  repository/section_repository.py
    - db.add(Section(name=name))
    - db.commit(), db.refresh()
    - Returns Section model
         │
         ▼
  router receives Section → serializes to SectionRead → 201 Created
```

---

## 4. Module Organization

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  ← FastAPI application factory
│   ├── config.py                ← Settings (pydantic-settings, env vars)
│   ├── database.py              ← SQLAlchemy engine + session dependency
│   ├── models/                  ← SQLAlchemy ORM models
│   ├── schemas/                 ← Pydantic request/response schemas
│   ├── routers/                 ← HTTP endpoints
│   ├── services/                ← Business logic
│   ├── repositories/            ← Data access
│   ├── dependencies/            ← Middleware (auth, pagination)
│   └── utils/                   ← Helpers (logging, date utils)
├── tests/                       ← pytest tests
├── alembic/                     ← Database migrations
└── alembic.ini
```

Each business domain maps to files within those folders (e.g., `section.py` exists
in `models/`, `schemas/`, `routers/`, `services/`, and `repositories/`).

---

## 5. Key Architectural Decisions

| Decision | Rationale | Reference |
|---|---|---|
| **PostgreSQL as single database** | Relational integrity across domains, joins for consolidated reports | [PRD §5](../prd.md) |
| **Supabase Auth** | Avoid building auth from scratch; JWT-based, row-level security ready | [ADR-001](adr-stack.md) |
| **API-first design** | Enables future clients (mobile, commercialization integration) | [PRD §5.2](../prd.md) |
| **Monolithic (not microservices)** | Small team, strong coupling between domains via material flow | [PRD §5.2](../prd.md) |
| **Anemic models (not rich domain)** | Pragmatic choice for junior developers; logic lives in services | [ADR-001](adr-stack.md) |
| **Reports inside the system** | Daily operational reports need no external BI tool; can be added later | [PRD §5.2](../prd.md) |
| **Future: document management** | Authenticated users enable future document workflows without migration | [PRD §6](../prd.md) |

---

## 6. Domain Mapping

| Domain | Models | Service | Router |
|---|---|---|---|
| **Operation** | Machine, Shift, Batch, Quality, Waste | `operation_service.py` | `routers/op/` |
| **Warehouse** | Receipt, Issue, Stock, Location | `warehouse_service.py` | `routers/wh/` |
| **Administration** | Valuation, Costing, Close | `admin_service.py` | `routers/admin/` |
| **Shared** | Employee, Section, Title, Supplier, UoM | `catalog_service.py` | `routers/catalogs/` |
| **Auth** | User (Supabase managed) | `auth_service.py` | `routers/auth.py` |

---

## 7. Testing Strategy

| Layer | Test approach | Tools |
|---|---|---|
| **Services** | Pure unit tests — mock repositories | pytest + unittest.mock |
| **Routers** | Integration tests — use TestClient with real or in-memory DB | pytest + httpx |
| **Repositories** | Integration tests — real test database | pytest + SQLAlchemy |
| **Auth** | Token mocking, permission edge cases | pytest + TestClient |

### Testing by layer isolation

```
Service test:     mock repository → test business rules only
Router test:      real service + real repository → test full HTTP flow
Repository test:  real database → test queries
```

---

## 8. Related Documents

- [ADR-001: Stack Technology Decision](adr-stack.md)
- [Backend Architecture Guide (team onboarding)](../dev-guide/backend-architecture.md)
- [PRD — System Requirements](../prd.md)
- [Git Workflow & Conventions](../dev-guide/git-workflow.md)
- [Sprint 1: Foundations](../sprints/01-foundations/README.md)

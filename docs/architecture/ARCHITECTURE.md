# Yarn EPR — Architecture

> Main architecture document for the Yarn EPR system.
> Defines the system overview, bounded contexts, architectural principles,
> and monorepo structure.
>
> **Status:** First draft — subject to review.
> **Project:** Pre-code. No implementation yet.
>
> **Related documents:**
>
> - `docs/architecture/backend.md` — Backend architecture (contexts, entities, ports)
> - `docs/architecture/frontend.md` — Frontend architecture (pages, API client, auth)
> - `docs/prd.md` — Master PRD
> - `docs/domain/` — Domain models

---

## 1. System Overview

Yarn EPR is a production management system for a textile plant's Production
Directorate. It covers two organizational units:

- **Warehouse Unit:** raw material reception, stock control, movements,
  finished product and supplies management
- **Operation Unit:** yarn spinning and lot processing, quality control,
  waste management

The system has two execution tiers:

```
┌─────────────────────────────────────────────────────────────┐
│                      YARN EPR                                │
│                                                              │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  │
│  │       FRONTEND          │  │        BACKEND           │  │
│  │  (SPA per context)      │◄─┤  (Hexagonal per context) │  │
│  │                         │  │                          │  │
│  │  Pages per context      │  │  Auth context            │  │
│  │  API client             │  │  Warehouse context       │  │
│  │  Auth integration       │  │  Operation context       │  │
│  │  UI components          │  │  Shared Catalogs         │  │
│  └─────────────────────────┘  └──────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    API (HTTP)                         │   │
│  │  Contract between frontend and backend                │   │
│  │  JWT-based auth                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Context Map

The backend is organized into three bounded contexts that mirror the
organizational structure:

```
┌──────────────────────────────────────────────────────────────┐
│                     YARN EPR SYSTEM                           │
│                                                               │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────────┐   │
│  │  AUTH    │    │  WAREHOUSE   │    │   OPERATION        │   │
│  │          │    │              │    │                   │   │
│  │ RBAC     │◄──►│ MP/PT/Supp. │◄──►│ Yarn Spinning     │   │
│  │ Perms    │    │ Movements    │    │ Lot Processing    │   │
│  │ Scopes   │    │ Stock        │    │ Quality/Waste     │   │
│  └──────────┘    └──────────────┘    └───────────────────┘   │
│                                                               │
│              ┌─────────────────────────────┐                  │
│              │     SHARED CATALOGS          │                  │
│              │  Employees, Machines,        │                  │
│              │  YarnCounts, Sections        │                  │
│              └─────────────────────────────┘                  │
└──────────────────────────────────────────────────────────────┘
```

| Context | Responsibility | Depends on |
|----------|----------------|------------|
| **Auth** | Authentication, RBAC authorization, users and roles | Shared Catalogs (Employees) |
| **Warehouse** | Inventory (MP, PT, Supplies), movements, stock, lot identity | Auth, Shared Catalogs |
| **Operation** | Yarn Spinning and Lot Processing | Auth, Warehouse (lot code), Shared Catalogs |
| **Shared Catalogs** | Master data (users, machines, yarn counts, shifts, sections) | — |

> Context detail (entities, ports, business rules) is in
> `docs/architecture/backend.md`.

---

## 3. Architectural Principles

### 3.1 Hexagonal per context

Every backend context follows Ports & Adapters (hexagonal):

```
Domain        → Pure entities + business rules (no IO)
Application   → Use cases orchestrating auth + domain + persistence
Infrastructure → Concrete implementations (DB, cache, external APIs)
Interfaces    → External request translation to use case calls
```

### 3.2 Append-only for business records

Records representing real physical events (movements, production discharges,
stage records) are immutable. They are never edited or deleted. Corrections
are new records tracing back to the original.

### 3.3 Auth per use case, not global middleware

Each use case decides when to call `AuthorizationPort.check`. No middleware
intercepts every request. Control lives in code, not configuration.

### 3.4 Isolated contexts

Each context owns its data and tables. No context accesses another context's
DB directly. Communication happens through shared identifiers:

- **Lot code** flows across Warehouse ↔ Operation
- **employeeId** (user) flows across Auth ↔ all contexts
- **Shared catalogs** are read from Shared Catalogs, not replicated

### 3.5 Frontend as API client

The frontend is a SPA that consumes the backend API. It has no business
logic or direct data access. Its responsibility is presentation and user
interaction.

> Frontend detail is in `docs/architecture/frontend.md`.

---

## 4. Frontend-Backend Communication

```
┌──────────┐         HTTP (JSON)          ┌──────────┐
│ FRONTEND │ ◄──────────────────────────► │ BACKEND  │
│          │                              │          │
│  SPA     │   POST /<context>/<action>   │  REST    │
│          │   → receives JWT             │  API     │
│          │                              │          │
│          │   Every request carries      │          │
│          │   Authorization: Bearer JWT  │          │
│          │                              │          │
└──────────┘                              └──────────┘
```

- Every request carries the JWT token in the header
- Backend validates the token and resolves permissions per use case
- Frontend does NOT interpret roles or permissions — it shows/hides UI based on what the API returns
- The API is the contract: frontend and backend agree on endpoints, data shapes, and error codes

---

## 5. Monorepo Structure

```
yarn-epr/
├── backend/
│   ├── auth/
│   │   └── (domain, application, infrastructure, interfaces)
│   ├── warehouse/
│   │   └── (domain, application, infrastructure, interfaces)
│   ├── operation/
│   │   ├── yarn-spinning/
│   │   └── lot-processing/
│   └── shared/
│       ├── domain/
│       └── kernel/
│
├── frontend/
│   ├── src/
│   │   ├── pages/          # One page per feature
│   │   ├── components/     # Reusable components
│   │   ├── api/            # HTTP client
│   │   ├── auth/           # Login, token, protected routes
│   │   └── shared/         # Shared UI components
│   └── ...
│
├── docs/
│   ├── architecture/       
│   ├── prd/
│   ├── domain/
│   └── ...
│
└── ...
```

---

## 6. Architectural Decisions

| ID | Decision | Context |
|----|----------|----------|
| ADR-001 | **Append-only for business records.** Movements, ProductionDischarge, and StageRecord are immutable. Corrections are new records with traceability to the original. | These records represent real physical events. In a textile plant, a stock movement is never deleted — it is reversed. |
| ADR-002 | **Auth per use case, not global middleware.** Each use case calls `AuthorizationPort.check` explicitly. | Read-only operations may not need an explicit check (scope filtering happens at the query level). Not all use cases require the same auth level. |
| ADR-003 | **RBAC: seed + code, no permission UI.** Roles, scopes, and the permission matrix are deployed as seed data. | Simplifies the first version. Changing the matrix requires a code change and deploy. |
| ADR-004 | **Lot identity owned by Warehouse.** Warehouse generates the lot code; Operation reads it but does not modify it. The exact format will be defined during implementation. | End-to-end consistency. Communication between contexts is via identifier, not direct API calls. |
| ADR-005 | **Shared Catalogs centralized.** Catalogs like Users, Machines, YarnCounts are managed as master data. | Data consistency. Changes are visible across all contexts. Risk of coupling if catalogs grow without governance. |
| ADR-006 | **Frontend as API client.** No business logic. Presentation and interaction only. | Clear separation of concerns. The frontend can be replaced without affecting business rules. |

---

## 7. Related Documents

| Document | Content |
|-----------|-----------|
| `docs/architecture/backend.md` | Backend architecture: entities, ports, rules for Auth, Warehouse, Operation, and Shared Catalogs |
| `docs/architecture/frontend.md` | Frontend architecture: page structure, API client, components, auth flow |
| `docs/prd.md` | Master PRD |
| `docs/prd/warehouse.md` | Warehouse Unit PRD |
| `docs/prd/operation.md` | Operation Unit PRD |
| `docs/domain/` | Detailed domain models per context |

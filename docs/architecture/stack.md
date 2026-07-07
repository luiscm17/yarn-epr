# Yarn EPR — Stack Baseline

> Stable stack baseline for the current architecture.
> This document captures the technologies and runtime capabilities that are part of the project baseline today.

---

## 1. Purpose

This document defines the current stack baseline for Yarn EPR so architecture, backend, and frontend work can align on a shared technical foundation.

It does **not** define deployment/provider choices or future optional infrastructure.

---

## 2. Architecture style baseline

| Area | Baseline |
|---|---|
| Domain modeling | **DDD** |
| System structure | **Hexagonal Architecture** |
| Domain partitioning | **Bounded contexts** aligned with the architecture context map |

---

## 3. Application stack baseline

| Layer | Baseline |
|---|---|
| Backend framework | **FastAPI** |
| Backend language | **Python** |
| Backend data/contracts | **Pydantic** |
| ORM / database access | **SQLAlchemy 2** |
| Database migrations | **Alembic** |
| Frontend framework | **React** |
| Frontend language | **TypeScript** |
| Frontend tooling | **Vite** |
| Database | **PostgreSQL** |
| Authorization baseline | Internal **`access`** context with **RBAC**, **scopes**, and **exceptions** |

---

## 4. Core runtime and support capabilities in baseline

| Capability | Baseline status |
|---|---|
| Migrations | Included |
| Structured logging | Included |
| Audit trail | Included |

---

## 5. Explicitly out of baseline for now

| Item | Status |
|---|---|
| Cache as a mandatory dependency | Out of baseline |
| Queue / messaging | Out of baseline |
| Blob storage | Out of baseline |
| File import pipeline | Out of baseline |

---

## 6. Related architecture documents

| Document | Purpose |
|---|---|
| [Architecture](./ARCHITECTURE.md) | Main system architecture and context map |
| [Context Boundaries and Ownership](./context-boundaries-and-ownership.md) | Boundary and ownership decisions |
| [Backend Architecture](./backend.md) | Backend-oriented design view |
| [Frontend Architecture](./frontend.md) | Frontend-oriented design view |

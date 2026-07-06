# Yarn EPR — Backend Technical Design Baseline

> First detailed backend technical design artifact for Yarn EPR.
> This document sits below the overview layer in
> [Architecture](../ARCHITECTURE.md),
> [Context Boundaries and Ownership](../context-boundaries-and-ownership.md),
> [Stack Baseline](../stack.md), and
> [Backend Architecture](../backend.md).

---

## 1. Purpose and scope

This document defines the **first stable technical-design layer for the backend**.

Its job is to make the backend structure explicit enough to support later work on:

- domain modeling
- application-service design
- API design
- persistence strategy
- database design

without jumping too early into SQL, tables, or low-level implementation.

This document focuses on:

- backend module boundaries
- per-context record/aggregate families
- use-case groupings
- ports and contracts between contexts
- correction and audit implications
- dependency direction and technical constraints

---

## 2. Position in the architecture set

This document belongs to the detailed backend-design layer within the current architecture set.

| Layer | Document | Role |
|---|---|---|
| Stable overview | [Architecture](../ARCHITECTURE.md) | System-wide context map, lifecycle, and architectural principles |
| Stable overview | [Context Boundaries and Ownership](../context-boundaries-and-ownership.md) | Business ownership rules and boundary decisions |
| Stable overview | [Stack Baseline](../stack.md) | Technology baseline and architectural style |
| Stable overview | [Backend Architecture](../backend.md) | High-level backend-oriented architecture view |
| Detailed backend design | [Backend Technical Design](./backend-technical-design.md) | Technical backend module design baseline |
| Detailed backend design | [Persistence Design Principles](./persistence-design-principles.md) | Conceptual persistence ownership, identity, correction, and time-model rules |
| Context-level schema design | [Warehouse Schema Design](./warehouse/schema-design.md) | First Warehouse-focused schema-design artifact above SQL |

---

## 3. Backend module mapping

The backend should keep descriptive architecture names in documentation while using concise code-facing module names in implementation.

| Architecture context | Code-facing module | Primary responsibility |
|---|---|---|
| Warehouse | `warehouse` | Custody, stock movements, production identity setup, finished-product reception, and warehouse lifecycle |
| Yarn Spinning | `yarn-production` | Continuous production records before any physical lot exists |
| Lot Processing | `batch-processing` | Physical lot birth, sequential stage history, delivery back to Warehouse |
| Access Control | `access` | RBAC, scopes, permission assignments, exceptions, and authorization decisions |
| Shared Reference Data | `catalogs` | Canonical catalogs, shared identifiers, and controlled vocabularies |

### Technical boundary rule

Each module should own its own:

- domain concepts
- application use cases
- repository contracts
- integration contracts
- correction rules
- audit responsibilities for its own records

No module should write directly into another module's internal record model.

---

## 4. Cross-context backend design rules

### 4.1 Boundary-preserving collaboration

Cross-context collaboration should happen through explicit contracts such as:

- read ports
- command/integration ports
- published read models
- authorization decision ports
- catalog validation/query ports

### 4.2 Identity and lot separation

The backend must preserve this split:

- **Warehouse** defines the production identity
- **Lot Processing** creates the physical lot
- **Yarn Spinning** never pretends to own a lot aggregate

### 4.3 Correction and audit baseline

All business contexts must support controlled corrections with audit trail.

At minimum, each context design must account for:

- editable operational records inside a policy window
- elevated correction authority outside the normal window
- audit capture for who changed what, when, why, and under which authorization scope

### 4.4 Support contexts remain support contexts

- `access` governs authorization, not business meaning
- `catalogs` provides canonical references, not workflow ownership

---

## 5. Per-context technical design baseline

## 5.1 `warehouse`

### Record / aggregate families

- Raw material reception (`bales`)
- Production identity definition
- Material emission to production
- Finished-product reception from Operation
- PT availability / disposition / classification
- PT exit and return records
- Supply movement records

### Use-case groups

- Receive and register raw material
- Define production identity from available raw material
- Emit material to production with authorization
- Receive finished product back from Operation
- Classify finished product for warehouse disposition
- Execute sale, transfer, return, and stock-affecting warehouse actions
- Query stock, movement history, and custody traceability

### Ports / contracts

- production identity read/export contract for downstream contexts
- stock balance and movement persistence ports
- warehouse authorization policy port
- finished-product delivery intake contract from `batch-processing`
- audit trail writer port
- catalog query/validation ports

### Correction and audit implications

- reception, identity, emission, PT reception, and PT classification are separate auditable business acts
- Warehouse corrections must not rewrite Lot Processing stage history
- PT quality state, warehouse availability/disposition, and physical presentation must remain separately auditable dimensions

### Key dependencies

- Depends on `access` for action + scope authorization
- Depends on `catalogs` for suppliers, units, movement types, employees, yarn counts, destinations
- Consumes delivery context from `batch-processing`
- Exposes production identity and material availability to `yarn-production` and `batch-processing`

## 5.2 `yarn-production`

### Record / aggregate families

- Production discharge records
- Progress records
- Process quality records
- Spinning waste records
- Skein output availability views/contracts

### Use-case groups

- Register production by machine / shift / yarn count / discharge
- Register section progress where applicable
- Register process-quality controls
- Register spinning waste by section or machine group
- Publish skein availability for downstream physical lot assembly
- Query operational production summaries by section, shift, machine, and yarn count

### Ports / contracts

- production record persistence ports
- progress persistence ports
- quality and waste persistence ports
- production authorization policy port
- skein availability publication/read port
- upstream production identity reference read port
- audit trail writer port
- catalog query/validation ports

### Correction and audit implications

- correction rules must preserve the difference between business date, shift, and system timestamp
- calculated values such as net weights should remain explainable and auditable
- corrections must not fabricate a lot history that does not exist in this context

### Key dependencies

- Depends on `access` for register/validate/approve/correct permissions
- Depends on `catalogs` for machines, machine groups, sections, shifts, employees, yarn counts
- Consumes production identity and material context from `warehouse`
- Exposes skein availability and readiness to `batch-processing`

## 5.3 `batch-processing`

### Record / aggregate families

- Physical lot aggregate
- Lot stage records
- Stage note / inconvenience records
- Stage waste records
- Delivery-to-Warehouse record

### Use-case groups

- Assemble the physical lot in the Inventory stage from upstream identity and skein availability
- Advance the lot through its ordered stage history
- Register stage-local verified data, generated data, stage notes/exceptions, and waste
- Capture final quality state and delivery conditions
- Deliver the processed lot back to Warehouse
- Query lot history, current stage, delays, and cross-stage traceability

### Ports / contracts

- physical lot persistence ports
- lot stage sequence policy port
- skein availability intake port
- warehouse production identity read port
- lot-processing authorization policy port
- delivery contract toward `warehouse`
- audit trail writer port
- catalog query/validation ports

### Correction and audit implications

- the Inventory stage is the auditable birth of the physical lot
- stage records must preserve the single-stage-record model rather than split into artificial receipt/delivery pairs
- each correction must preserve stage sequence meaning and historical responsibility
- The Quality stage documents delivery condition, but does not decide Warehouse disposition

### Key dependencies

- Depends on `access` for stage-level permissions and elevated corrections
- Depends on `catalogs` for stages, shifts, equipment, employees, defect vocabularies, controlled values
- Consumes production identity from `warehouse`
- Consumes skein availability from `yarn-production`
- Exposes processed-lot delivery back to `warehouse`

## 5.4 `access`

### Record / aggregate families

- System role/capability definitions
- Permission assignments
- Scope definitions
- Exceptions or overrides
- Permission change audit records

### Use-case groups

- Define capabilities and protected actions
- Assign permissions by scope
- Manage overrides and exceptions
- Evaluate authorization decisions for business actions
- Audit permission changes and effective access history

### Ports / contracts

- authorization decision port
- permission assignment persistence ports
- scope persistence ports
- permission audit ports
- user/employee identity mapping read ports

### Correction and audit implications

- permission changes are themselves auditable domain events
- override behavior must remain explicit and reviewable
- correction of access assignments must not erase prior effective authorization history

### Key dependencies

- Depends on `catalogs` or platform identity references for users/employees and organizational dimensions
- Consumes protected action and scope definitions from business modules
- Exposes authorization decisions to every business context

## 5.5 `catalogs`

### Record / aggregate families

- Employee/user references
- Machine and machine-group catalogs
- Section, stage, and shift catalogs
- Yarn counts
- Movement types, units, and shared controlled vocabularies

### Use-case groups

- Maintain canonical reference values
- Validate shared references used by business contexts
- Publish query access to reusable catalog data
- Audit relevant catalog changes that affect cross-context behavior

### Ports / contracts

- catalog query ports
- reference validation ports
- catalog maintenance persistence ports
- reference change audit ports

### Correction and audit implications

- catalog corrections can have broad downstream impact and must remain traceable
- reference changes must not silently redefine historical business records without an explicit policy

### Key dependencies

- Depends on business governance for catalog ownership and curation rules
- Exposes canonical values and stable IDs to `warehouse`, `yarn-production`, `batch-processing`, and `access`

---

## 6. Dependency summary

| Module | Depends on | Provides to |
|---|---|---|
| `warehouse` | `access`, `catalogs`, delivery data from `batch-processing` | production identity and warehouse lifecycle data |
| `yarn-production` | `access`, `catalogs`, production context from `warehouse` | skein availability and spinning records |
| `batch-processing` | `access`, `catalogs`, identity from `warehouse`, skein availability from `yarn-production` | processed-lot delivery and lot traceability |
| `access` | shared identity references, protected action definitions | authorization decisions and policy enforcement |
| `catalogs` | governance inputs | canonical references and validations |

---

## 7. What this document intentionally does not define yet

This document does **not** define:

- SQL schema
- table structure
- foreign keys
- exact ORM models
- endpoint URLs or payload shapes
- message/event infrastructure choices
- final package layout inside a concrete codebase
- detailed read-model projections or reporting schemas

Those decisions should come later, after domain and persistence design are derived from these module boundaries.

---

## 8. DB-design constraints derived from this document

Any later persistence or database design must preserve these constraints:

1. **Persistence follows ownership.** Each record family belongs to the context that owns its business meaning.
2. **Identity separation remains explicit.** Production identity and physical lot must not collapse into one premature persistence model.
3. **Correction and audit are first-class.** Persistence must support editable business truth with auditable history.
4. **Cross-context references stay explicit.** Shared identifiers and integration references must preserve context ownership.
5. **Read models do not redefine ownership.** Cross-context traceability and reporting views must not flatten the owning write models.

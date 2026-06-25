# Yarn EPR — Backend Architecture

> Detailed backend architecture document.
> Defines entities, ports, business rules, and code structure for each
> backend context.
>
> **Main document:** `docs/architecture/ARCHITECTURE.md`

---

## 1. Per-Context Structure

Every backend context follows the same hexagonal structure:

```
<name>/
├── domain/           # Pure entities + value objects + domain services
├── application/      # Use cases (orchestrate auth + domain + persistence)
├── infrastructure/   # Concrete implementations (repositories, adapters)
└── interfaces/       # External request translation to use case calls
```

The shared kernel (`shared/kernel`) defines the base abstractions:
`Entity`, `ValueObject`, `Port`, `UseCase`.

### Directory Tree

The architecture defines *what* and *where*, not the language-specific file name.

```
backend/
├── auth/
│   ├── domain/               # User, RoleDefinition, Scope, Assignment,
│   │                         #   AssignmentException, PermissionMatrix,
│   │                         #   check_access (domain service)
│   ├── application/          # AssignRole, CheckAccess, ManageUser (use cases)
│   ├── infrastructure/       # JwtDecoder, RbacCache + repository implementations
│   └── interfaces/           # AuthRoutes (login/profile/refresh),
│                             #   TokenExtractor (middleware)
│
├── warehouse/
│   ├── domain/               # Movement, StockBalance (calculated), Lot (identity),
│   │                         #   Supplier, Client
│   ├── application/          # ReceiveMp, EmitToProduction, ReceivePt, SellPt,
│   │                         #   CalculateStock, ClosePeriod (use cases)
│   ├── infrastructure/       # Repository implementations
│   └── interfaces/           # MovementRoutes (CRUD), StockRoutes (balance)
│
├── operation/
│   ├── yarn-spinning/
│   │   ├── domain/           # ProductionDischarge, SkeiningProduction,
│   │   │                     #   AdvanceTracking, QualityControl, WasteRecord
│   │   ├── application/      # RegisterDischarge, RegisterAdvance,
│   │   │                     #   RegisterQuality, RegisterWaste (use cases)
│   │   ├── infrastructure/   # Repository implementations
│   │   └── interfaces/       # DischargeRoutes, AdvanceRoutes, QualityRoutes
│   │
│   └── lot-processing/
│       ├── domain/           # Lot (operation view), StageRecord, Observation,
│       │                     #   QualityClassification
│       │                     # value_objects/: InventoryData, DyeingData,
│       │                     #   DryingData, WindingData, BaggingData, QualityData
│       ├── application/      # EnterStage, ExitStage, RegisterObservation,
│       │                     #   ClassifyQuality, DeliverToWarehouse (use cases)
│       ├── infrastructure/   # Repository implementations
│       └── interfaces/       # LotRoutes, StageRoutes
│
└── shared/
    ├── domain/               # Employee, Machine, MachineGroup, Section, Shift,
    │                         #   YarnCount, MovementType
    └── kernel/               # Entity, ValueObject (base classes),
                              #   Port (interface marker), UseCase (base class)
```

---

## 2. Context: Auth

### 2.1 Purpose

Manage system access: who can log in and what operations they can perform
on each resource.

### 2.2 Entities

| Entity | Description |
|---------|-------------|
| **User** | System user. Has name, email, password hash, active/inactive flag. Roles are resolved through assignments, not stored directly. |
| **RoleDefinition** | Generic role with a base set of allowed actions. Examples: production roles (operator, technician, overseer), management roles (director, executive), and system administrator. The exact list is defined during implementation. |
| **Scope** | Hierarchical boundary where a permission applies. Uses prefixed paths (`production.*`, `warehouse.*`, `production.hilature.continuas`) stored as tree paths. |
| **Assignment** | Links a User, a RoleDefinition, and a Scope. A user can have multiple assignments. |
| **AssignmentException** | Granular exception that allows or denies a specific action on a resource within an assignment. |
| **PermissionMatrix** | Defines which actions each RoleDefinition allows on each ResourceType. Fixed catalog deployed as seed data. |

### 2.3 Authorization Flow

```
1. Is the user inactive? → deny
2. Load all assignments for the user
3. For each assignment:
   a. Does the scope prefix match the resource path?
   b. If it covers → check exceptions
      - deny exception → deny (deny always wins)
      - allow exception → allow
   c. No exception → check the permission matrix
         (role allowed actions × resource type × action)
4. Did any assignment allow? → allow
5. Otherwise → deny
```

### 2.4 Business Rules

- Deny always wins over Allow
- Assignments, roles, and matrix are deployed as seed data (no permission management UI)
- Session token carries user identity and role identifier; scopes are resolved from cache
- SysAdmin only manages users and assignments — has no permissions on business data
- Instance restrictions (e.g., "operator can only see their machine") are NOT generic authorization — they are validated in the corresponding use case

---

## 3. Context: Warehouse

### 3.1 Purpose

Record all inventory movements (inbound and outbound), calculate balances,
and maintain lot traceability from raw material reception to finished
product exit.

### 3.2 Subdomains

| Subdomain | Unit | Movement types |
|-----------|------|----------------|
| **Raw Material (MP)** | kg | Reception, Emission to Production |
| **Finished Product (PT)** | kg | Reception from Production, Direct Sale, Comercialización Transfer, Return |
| **Supplies** | per category (kg, L, units) | Reception from Supplier, Production Consumption, Return to Supplier |

### 3.3 Entities

| Entity | Description |
|---------|-------------|
| **Movement** | Immutable inbound or outbound record. Contains temporal data (date, correlative per type/year), item data (subdomain, movement type, direction, lot code when applicable, quantity, unit), authorization trail (authorized by, responsible person), and a reference to a previous movement for corrections. The exact field set is defined during implementation. |
| **StockBalance** | Not a stored entity. Calculated as: `(Previous Balance + Σ Entries) − Σ Exits`. |
| **Lot** (identity) | The lot code and its metadata (yarn count, color, client, supplier). Created by Warehouse on reception, read by Operation. |
| **Supplier** | Raw material and supplies supplier. |
| **Client** | PT destination client (direct or comercialización). |

### 3.4 Ports

| Port | Input | Output | Used by |
|------|-------|--------|---------|
| `MovementRepositoryPort.save` | Movement | Movement | Warehouse use cases |
| `MovementRepositoryPort.findByLot` | lotCode | list of Movements | Use cases, reports |
| `StockCalculationPort.calculate` | filters | StockBalance | Reports, period closures |
| `LotRepositoryPort.findByIdentity` | lotCode | Lot (identity) | Operation (read-only) |

Additionally, Warehouse **consumes** `AuthorizationPort.check` from Auth.

### 3.5 Business Rules

- **Append-only:** Movements are never edited, deleted, or overwritten. Corrections are new Movements referencing the original record.
- **Calculated stock, not stored:** StockBalance is always derived from Movements.
- **Role-based authorization:** Emission to Production and PT exits require Production Chief. Supplies consumption requires Shift Supervisor.
- **Period closure:** Movements in a closed period become read-only.
- **Reception rejection:** if PT arrives from Operation with inconsistent data, Warehouse rejects the reception.

---

## 4. Context: Operation

### 4.1 Purpose

Record the transformation of raw material into finished product. Operation
has two distinct sub-processes: Yarn Spinning (continuous flow) and Lot
Processing (batch flow).

### 4.2 Yarn Spinning

Continuous, sequential flow across 5 sections. Raw material is not tracked
by lot within sections — granularity is machine × shift × yarn count.

#### Entities

| Entity | Description | Append-only |
|---------|-------------|-------------|
| **ProductionDischarge** | Machine production discharge. Net weight calculated by the system. | Yes |
| **SkeiningProduction** | Skeining section production (no spindles, uses skeins). | Yes |
| **AdvanceTracking** | End-of-shift machine summary: input/output/discharged material. Validates coherence with discharges. | Yes |
| **QualityControl** | Per-section/machine quality control. Method varies by section (Sample, MachineRegister). | Yes |
| **WasteRecord** | Real waste per machine group. Recorded by Inventario role. | Yes |

#### Business Rules

- All records are immutable. Corrections are new traceable records.
- Net weight is calculated by the system, never entered manually.
- Off-spec skeins from Skeining are NOT waste — they return to an earlier stage as rework.
- Advance tracking and production must be coherent (advance validates production).

### 4.3 Lot Processing

Sequential 6-stage flow with per-lot traceability. Each lot has its own
independent timeline.

#### Entities

| Entity | Description | Append-only |
|---------|-------------|-------------|
| **Lot** (Operation view) | Same lot code. Read-only identity from Warehouse. | — |
| **StageRecord** | Lot passage through a stage. Entry and exit timestamps, stage-specific technical data. | Once closed (exit recorded) |
| **Observation** | Incident or defect found during a stage. Predefined category per stage type. | Once StageRecord is closed |
| **QualityClassification** | Final Quality verdict: standard, with nomenclature, with observations, rejected. | Yes |

#### Stages

| # | Stage | Recorded by | Key data |
|---|-------|-------------|----------|
| 1 | Inventory | Inventario | Yarn count, skeins, total weight |
| 2 | Dyeing | Tintorería | Skeins, net weight, temperature, vat |
| 3 | Drying | Tintorería | Skeins, total weight |
| 4 | Winding | Inventario | Cones, waste |
| 5 | Bagging | Embolsado | Bags, cones, waste |
| 6 | Quality (lot) | Calidad | Defects, classification, nomenclature |

#### Business Rules

- **Sequential progression:** Stage N must be closed before Stage N+1 can be created.
- **No backtracking:** A lot never returns to a previous stage.
- **Immutability:** Once a StageRecord has its exit recorded, its data cannot be modified.
- **Quality is documentation, not a gate:** The lot is delivered to Warehouse with its classification, but Quality does not block delivery.
- **Skeining consolidates:** It is the point where Yarn Spinning ends and Lot Processing begins.

### 4.4 Ports

| Port | Input | Output | Used by |
|------|-------|--------|---------|
| `ProductionDischargeRepositoryPort` | — | ProductionDischarge | Yarn Spinning use cases |
| `StageRecordRepositoryPort` | — | StageRecord | Lot Processing use cases |
| `QualityRepositoryPort` | — | QualityControl / QualityClassification | Use cases |

Additionally, Operation **consumes** `AuthorizationPort.check` from Auth and
`LotRepositoryPort.findByIdentity` from Warehouse.

---

## 5. Shared Catalogs

Master data shared across contexts. Not owned by any single context —
managed centrally. The table below describes *what information* each
catalog contains, not the specific field names — those will be defined
during implementation and may include additional attributes.

| Catalog | Contains | Used by |
|---------|----------|---------|
| **User** | Personal identification (name, email), organizational role (not RBAC role), active status | Auth, Warehouse, Operation |
| **Machine** | Machine identity, associated section and group, machine type (PSJ, FIN, etc.) | Operation (Yarn Spinning) |
| **MachineGroup** | Group identity and its section | Operation (waste) |
| **Section** | Section identity and name (Preparación, Continuas, etc.) | Operation |
| **Shift** | Shift identity and code (e.g., A, B, C) | Warehouse, Operation |
| **YarnCount** | Yarn count identity and designation (e.g., 2/18, 2/32) | Warehouse, Operation |
| **MovementType** | Movement type identity, subdomain, direction (in/out), whether it requires authorization | Warehouse |

---

## 6. Data Flow Across Contexts

### 6.1 Lot Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WAREHOUSE                                     │
│                                                                      │
│  1. MP Reception → lot code is created                              │
│  2. Enrichment → yarn count, color, client are added                │
│  3. Emission to Production → lot leaves Warehouse                    │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ lot code (identifier only)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        OPERATION                                     │
│                                                                      │
│  4. Yarn Spinning → Skeining consolidates the yarn                  │
│  5. Lot Processing → Inventario assembles the lot                    │
│  6. Stages 1-6 → each StageRecord is recorded sequentially          │
│  7. Quality Classification → final verdict                          │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ processed lot + documentation
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        WAREHOUSE                                     │
│                                                                      │
│  8. PT Reception → Warehouse verifies against Operation records     │
│  9. Storage → bagged or bulk                                        │
│  10. Sale / Transfer → lot exits the system                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Authorization Flow

```
               ┌──────────┐
               │ FRONTEND │
               └────┬─────┘
                    │ Request + JWT
                    ▼
           ┌─────────────────┐
           │  Interfaces     │  extracts token, calls use case
           └────────┬────────┘
                    ▼
           ┌─────────────────┐
           │  Use Case       │  calls AuthorizationPort.check
           └────────┬────────┘
                    │
           ┌────────▼────────┐
           │  Auth domain    │  resolves: role → assignments → scopes
           │                  │  → check exceptions → check matrix
           └─────────────────┘
                   │
          ┌────────▼────────┐
          │  Authorized?    │
          │  yes → proceed  │
          │  no → 403       │
          └─────────────────┘
```

### 6.3 Corrections and Traceability

When a record needs correction:

```
1. The original record stays intact (append-only)
2. A new record is created referencing the original:
   - In Warehouse: a new Movement references the original
   - In Yarn Spinning: a new ProductionDischarge with traceability
   - In Lot Processing: a new Observation on the closed StageRecord
3. Calculations (stock, total production) consider both records
```

**Pending:** cross-context corrections (Operation → Warehouse). Not defined yet.

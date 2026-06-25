# Yarn EPR — Frontend Architecture

> Frontend architecture document. Defines page structure, API client,
> auth integration, and component organization.
>
> **Main document:** `docs/architecture/ARCHITECTURE.md`

---

## 1. Purpose

The frontend is the user interface of the Yarn EPR system. Shift supervisors,
warehouse managers, quality control, and the production chief record data,
check status, and generate reports through this interface.

**Principle:** the frontend contains no **domain** business logic — it does not
decide whether a movement can be reversed, whether a user has permission to
register a discharge, or whether a lot can advance to the next stage.

However, the frontend DOES perform **presentation logic** needed for a
spreadsheet-like UX (the primary data entry interface). This includes:

- Sum totals per column or section
- Cell-to-cell operations (e.g., `netWeight = grossWeight - tare`)
- Filtering and aggregations similar to `=SUMIFS()` in Excel
- Client-side previews before sending data to the API

These calculations exist only to give the operator immediate visual feedback,
matching the Excel/Google Sheets experience they currently use. The backend
always re-validates and recalculates before persisting.

**Guard:** domain rules (immutability, authorization, sequential stage
progression) are never enforced by the frontend. Spreadsheet formulas are a UX
tool, not an authority.

---

## 2. General Structure

The frontend is organized into pages that mirror the backend contexts:

```
frontend/
└── src/
    ├── pages/
    │   ├── auth/                     # Login, logout
    │   ├── warehouse/
    │   │   ├── index/                # WarehouseDashboard
    │   │   ├── mp/                   # MPReception, Emission
    │   │   ├── pt/                   # PTReception, Sales
    │   │   ├── supplies/             # SuppliesEntry, Consumption
    │   │   └── reports/              # StockReport
    │   ├── operation/
    │   │   ├── yarn-spinning/        # Discharge, Advance, Quality, Waste
    │   │   └── lot-processing/       # LotList, Detail, StageEntry, Quality
    │   └── reports/                  # Daily, Production reports
    │
    ├── components/
    │   ├── ui/                       # Base (DataTable, Modal, Button, etc.)
    │   ├── spreadsheet/              # Spreadsheet grid, formula bar
    │   ├── forms/                    # Domain forms (Discharge, Movement, Stage)
    │   └── layout/                   # AppShell, Sidebar, Header
    │
    ├── api/                          # HTTP client, endpoint modules
    ├── auth/                         # AuthContext, token, ProtectedRoute
    ├── routes/                       # Route definitions
    ├── hooks/                        # Shared hooks
    └── shared/                       # Types, constants, utils
```

### 2.1 Pages / Components Separation

- **`pages/`**: one page per complete feature. Each page is a component that
  combines layout + API data + specific UI components. They are the entry
  point for each route.

- **`components/ui/`**: reusable atomic components (DataTable, Modal,
  FormField, Button, Select). Domain-agnostic.

- **`components/forms/`**: domain-specific forms that combine UI components
  with API calls (RegisterDischargeForm, CreateMovementForm, EnterStageForm).

- **`components/layout/`**: application shell: AppShell, Sidebar, Header,
  Breadcrumbs.

### 2.2 Spreadsheet as Primary Data Entry

Most production registration forms (discharges, advance tracking, quality
control) use a **spreadsheet-style component** rather than traditional HTML
forms. This matches the existing operator workflow in Excel/Google Sheets:

- **Editable grid** with cell navigation (Tab/Enter/arrows)
- **Cell-level formulas** (`=SUM()`, `=SUMIFS()`, cell references) for
  real-time calculation preview
- **Copy-paste from external spreadsheets**
- **Per-column filters** for data review before saving
- **Footer aggregations** (totals, averages, counts)

The spreadsheet component lives alongside standard UI components. A
production discharge page may use a spreadsheet grid for the data body
and standard Modal/Button for actions.

**Flow:**

```
1. Operator fills rows in the spreadsheet grid
2. Formulas calculate in real time (client-side only)
3. Operator reviews totals, filters, aggregations
4. On "Save", the frontend serializes cell values to JSON
5. Backend receives the data, re-calculates, authorizes, and persists
```

---

## 3. Pages per Context

### 3.1 Auth

| Page | Description |
|------|-------------|
| LoginPage | Login form. Sends credentials, receives JWT. |
| — | Logout: invalidates session, redirects to login. |

User registration is not available from the frontend — users are managed
by SysAdmin through the backend.

### 3.2 Warehouse

| Page | Description |
|------|-------------|
| WarehouseDashboard | Stock overview, latest movements, alerts. |
| MPReceptionPage | Register MP reception, generate lot code. |
| EmissionPage | Emit MP to Operation. Requires Production Chief auth. |
| PTReceptionPage | Receive PT from Operation, verify data. |
| SalesPage | Register direct sale or Comercialización transfer. |
| SuppliesEntryPage | Register supplies entry. |
| SuppliesConsumptionPage | Register supplies consumption. |
| StockReportPage | Check balances, per-lot movement history. |

### 3.3 Operation (Yarn Spinning)

| Page | Description |
|------|-------------|
| OperationDashboard | Production status per section and shift. |
| DischargePage | Register production discharge per machine. |
| AdvancePage | Register end-of-shift machine advance. |
| QualityControlPage | Register per-section/machine quality control. |
| WastePage | Register waste per machine group. |

### 3.4 Operation (Lot Processing)

| Page | Description |
|------|-------------|
| LotListPage | Lot list with filters by stage/status. |
| LotDetailPage | Lot detail: stages, observations, quality. |
| EnterStagePage | Register entry to a stage. |
| ExitStagePage | Register stage exit with technical data. |
| ClassifyQualityPage | Classify final lot quality. |
| AddObservationPage | Add observation to a stage. |

### 3.5 Reports

| Page | Description |
|------|-------------|
| DailyReportPage | Consolidated daily report for the Production Chief. |
| ProductionReportPage | Production vs planned by yarn count/period. |

---

## 4. Auth Integration

### 4.1 Authentication flow

```
1. User enters credentials on the login page
2. Frontend sends credentials to the auth endpoint → backend validates, returns JWT
3. Frontend stores the token (memory + storage)
4. Every request includes the token in the Authorization header
5. Token expires or is invalid → backend returns 401 → frontend redirects to login
```

### 4.2 Token

- Token contains user identity and role identifier (backend resolves permissions)
- Frontend does NOT interpret roles or permissions from the token
- Frontend only knows if there is an active session or not
- UI visibility (show/hide elements) is decided by:
  - Did the API return data? → show it
  - Did the API return 403? → hide the functionality

### 4.3 Protected routes

The frontend defines public routes (`/login`) and protected routes (everything
else). If there is no token, redirect to `/login`.

---

## 5. API Client

The frontend has an `api/` module that centralizes backend communication:

```
api/
├── client             # Base HTTP client (fetch wrapper)
├── auth               # Auth endpoints (login, refresh, logout)
├── warehouse          # Warehouse endpoints (movements, lots, stock)
├── operation          # Operation endpoints (discharges, stages, quality)
└── types              # Shared types between frontend and API
```

### 5.1 Client behavior

- Automatically attaches the JWT token to every request
- On 401, attempts token refresh or redirects to login
- On 403, propagates the error so the page can show "no permissions"
- On network error, shows disconnected state

### 5.2 API Contract

Frontend and backend agree on:

- Request and response format (JSON)
- Standard error codes: 400 (validation), 401 (unauthenticated),
  403 (unauthorized), 404 (not found), 409 (conflict),
  422 (invalid data)
- Pagination: list response includes data items, total count, and pagination metadata
- ISO 8601 dates

---

## 6. UI State

The frontend handles two types of state:

| Type | Where it lives | Examples |
|------|---------------|----------|
| **Server state** | API → cache | Movements, lots, discharges, stock |
| **Client state** | Local components | Forms, open modals, temporary filters |

**Server state:** fetched from the API and cached. Not duplicated in a global
store. If another component needs the same data, it calls the same endpoint
(the HTTP cache or API client prevents duplicate requests).

**Client state:** lives in the components that need it. Not elevated to a
global store unless multiple routes need it.

---

## 7. Code Structure

```
frontend/
├── index.html               # App entry point
├── build.config             # Build tool configuration
├── language.config          # Language/type system configuration
├── package.json             # Dependencies and scripts
│
└── src/
    ├── main                  # Entry point
    ├── App                   # Router + providers
    │
    ├── routes/
    │   ├── index             # Route definitions
    │   └── ProtectedRoute    # Auth wrapper
    │
    ├── pages/
    │   ├── auth/
    │   │   └── LoginPage
    │   │
    │   ├── warehouse/
    │   │   ├── WarehouseDashboard
    │   │   ├── MPReceptionPage
    │   │   ├── EmissionPage
    │   │   ├── PTReceptionPage
    │   │   ├── SalesPage
    │   │   ├── SuppliesEntryPage
    │   │   ├── SuppliesConsumptionPage
    │   │   └── StockReportPage
    │   │
    │   ├── operation/
    │   │   ├── OperationDashboard
    │   │   ├── yarn-spinning/
    │   │   │   ├── DischargePage
    │   │   │   ├── AdvancePage
    │   │   │   ├── QualityControlPage
    │   │   │   └── WastePage
    │   │   └── lot-processing/
    │   │       ├── LotListPage
    │   │       ├── LotDetailPage
    │   │       ├── EnterStagePage
    │   │       ├── ExitStagePage
    │   │       ├── ClassifyQualityPage
    │   │       └── AddObservationPage
    │   │
    │   └── reports/
    │       ├── DailyReportPage
    │       └── ProductionReportPage
    │
    ├── components/
    │   ├── ui/                 # DataTable, Modal, FormField, Select,
    │   │                       #   Button, Toast (atomic components)
    │   ├── spreadsheet/        # SpreadsheetGrid (grid library wrapper),
    │   │                       #   FormulaBar, ColumnFilter, FooterAggregation
    │   ├── forms/              # RegisterDischargeForm, CreateMovementForm,
    │   │                       #   EnterStageForm, QualityClassificationForm
    │   └── layout/             # AppShell, Sidebar, Header, Breadcrumbs
    │
    ├── api/                    # client (fetch wrapper), auth, warehouse,
    │                           #   operation (endpoint modules), types
    ├── auth/                   # AuthContext (session), useAuth (hook),
    │                           #   token (storage/headers)
    ├── hooks/                  # useSpreadsheet, useDebounce, usePagination
    └── shared/                 # types, constants, utils
```

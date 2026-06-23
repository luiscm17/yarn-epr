# DB Schema: Yarn Spinning

> **Domain:** Operation → Yarn Spinning
> **Source:** `docs/domain/operation/yarn-spinning.md`, `docs/prd/operation/yarn-spinning.md`
> **Related:** `docs/db/yarn-spinning-schema.dbml`
> **Stack:** PostgreSQL

---

## 1. Naming Conventions

| Scope | Convention | Example |
|---|---|---|
| Table names | `snake_case`, plural | `production_discharges` |
| Column names | `snake_case`, specific (avoid bare `name`) | `section_name`, `shift_name` |
| Primary keys | natural key when available | `machine_id = 'PSJ-1B'`, `shift_code = 'A'` |
| Foreign keys | `{referenced_table}_id` | `machine_id`, `yarn_count_id` |
| Timestamps | `created_at`, `updated_at` | — |
| Units in column name | where non-obvious | `tare_per_spindle_g`, `weight_input_kg` |

---

## 2. Shared Catalogs

### 2.1 `users`

System user reference. Shared catalog across all domains (Operation, Warehouse, Auth).
Placeholder until the Auth context is designed in detail.

| Column | Type | Notes |
|---|---|---|
| `user_id` | integer | PK |
| `full_name` | varchar(150) | |
| `role` | varchar(30) | ProductionManager, Supervisor, Quality, Inventory, WarehouseManager, WarehouseAssistant |
| `is_active` | boolean | |

### 2.2 `shifts`

Fixed shifts: Morning (A), Afternoon (B), Night (C). Hours are pre-established, not stored in DB.

| Column | Type | Notes |
|---|---|---|
| `shift_code` | varchar(1) | PK. A, B, C |
| `shift_name` | varchar(20) | Morning, Afternoon, Night |

### 2.3 `yarn_counts`

Yarn count titles (2/18, 2/32, 4/9, etc.). Each count has a base material type and dtex value.

| Column | Type | Notes |
|---|---|---|
| `yarn_count_id` | integer | PK |
| `yarn_count_name` | varchar(30) | UNIQUE. 2/18, 2/32, 4/9, 2/13, 2/24, 2/40, 3/11, Fantasy, Other |
| `material_type` | varchar(10) | HB, N, CH, etc. |
| `dtex` | decimal(8,2) | Decitex value |

### 2.4 `sections`

The 5 Yarn Spinning sections. Fields directly from PRD §2.2 and §5.2.

| Column | Type | Notes |
|---|---|---|
| `section_id` | integer | PK |
| `section_name` | varchar(50) | Preparation, RingSpinning, Winding, Twisting, Skeining |
| `has_advance` | boolean | false for Winding and Skeining (PRD §4.2) |
| `production_recorded_by` | varchar(20) | Quality, Inventory, Unassigned. From PRD §2.2 |
| `advance_recorded_by` | varchar(20) | Quality, Inventory, Unassigned. From PRD §2.2 |
| `quality_method` | varchar(20) | Samples, BodyKmCuts, RandomCheck. From PRD §5.2 |

### 2.5 `machine_groups`

Machine grouping for waste weighing (PRD §6.2).

| Column | Type | Notes |
|---|---|---|
| `machine_group_id` | integer | PK |
| `machine_group_name` | varchar(50) | |
| `section_id` | integer | FK → sections.section_id |

### 2.6 `machines`

Natural key: the machine code IS the primary key, configured in backend and shown as dropdown in frontend.

| Column | Type | Notes |
|---|---|---|
| `machine_id` | varchar(20) | PK. Natural key. E.g. PSJ-1B, FIN-A, CONT-0A, RET-1B, SKN-01 |
| `section_id` | integer | FK → sections.section_id |
| `machine_type` | varchar(10) | PSJ, FIN, or null. From PRD §2.2 — needed for FIN-only production, PSJ-only advance |
| `machine_group_id` | integer | FK → machine_groups.machine_group_id (nullable). From PRD §6.2 |
| `is_active` | boolean | default true |

---

## 3. Transaction Tables

### 3.1 `production_discharges`

Granular production discharge record (spindle-based).
Applies to: Preparation (FIN only), Ring Spinning, Winding, Twisting.

| Column | Type | Notes |
|---|---|---|
| `production_discharge_id` | integer | PK |
| `machine_id` | varchar(20) | FK → machines.machine_id |
| `shift_code` | varchar(1) | FK → shifts.shift_code |
| `date` | date | |
| `section_id` | integer | FK → sections.section_id |
| `yarn_count_id` | integer | FK → yarn_counts.yarn_count_id |
| `supervisor_id` | integer | FK → users.user_id |
| `foreman_id` | integer | FK → users.user_id (Quality or Inventory per section) |
| `gross_weight_kg` | decimal(8,2) | Full carriage gross weight (PRD §3.3) |
| `spindle_count` | integer | Operative spindles for this discharge (PRD §3.2) |
| `tare_per_spindle_g` | decimal(6,2) | Spindle/bobbin tare weight in grams (PRD §3.2) |
| `carriage_weight_kg` | decimal(8,2) | Empty carriage weight in kg (PRD §3.2) |
| `net_weight_kg` | decimal(8,2) | Calculated: gross − (tare_per_spindle × spindles / 1000) − carriage (PRD §3.2) |
| `comments` | text | |
| `edit_version` | integer | Default 1 (PRD YS-TR-01: append-only) |
| `created_at` | timestamptz | Default now() |

**Check constraint:**

```
net_weight_kg = gross_weight_kg - (tare_per_spindle_g * spindle_count / 1000) - carriage_weight_kg
```

**Indexes:**

- `idx_prod_machine_date` on (`machine_id`, `date`, `shift_code`)
- `idx_prod_section_date` on (`section_id`, `date`)

---

### 3.2 `skeining_productions`

Skeining production record. No spindles — uses skeins (PRD §3.3).

| Column | Type | Notes |
|---|---|---|
| `skeining_production_id` | integer | PK |
| `machine_id` | varchar(20) | FK → machines.machine_id |
| `shift_code` | varchar(1) | FK → shifts.shift_code |
| `date` | date | |
| `section_id` | integer | FK → sections.section_id (always Skeining) |
| `yarn_count_id` | integer | FK → yarn_counts.yarn_count_id |
| `supervisor_id` | integer | FK → users.user_id |
| `foreman_id` | integer | FK → users.user_id (Inventory, PRD §7) |
| `num_skeins` | integer | Number of skeins produced (PRD §3.3) |
| `weight_per_skein_g` | decimal(6,2) | Estimated weight per skein. 1 bunch = 10 skeins ~ 5kg (PRD §3.3) |
| `net_weight_kg` | decimal(8,2) | Calculated: num_skeins × weight_per_skein_g / 1000 (PRD §3.3) |
| `operator_name` | varchar(100) | Free text — operator-dependent production (PRD §3.3) |
| `comments` | text | |
| `edit_version` | integer | Default 1 (PRD YS-TR-01) |
| `created_at` | timestamptz | Default now() |

**Indexes:**

- `idx_skn_machine_date` on (`machine_id`, `date`, `shift_code`)
- `idx_skn_section_date` on (`section_id`, `date`)

---

### 3.3 `advance_trackings`

Advance tracking per machine/turn — summary and process control (PRD §4).
Applies to: Preparation (PSJ only), Ring Spinning, Twisting.
Winding and Skeining have no advance (PRD §4.2).

| Column | Type | Notes |
|---|---|---|
| `advance_tracking_id` | integer | PK |
| `machine_id` | varchar(20) | FK → machines.machine_id |
| `shift_code` | varchar(1) | FK → shifts.shift_code |
| `date` | date | |
| `section_id` | integer | FK → sections.section_id |
| `yarn_count_id` | integer | FK → yarn_counts.yarn_count_id |
| `supervisor_id` | integer | FK → users.user_id |
| `foreman_id` | integer | FK → users.user_id |
| `sample_gross_weight_g` | decimal(6,2) | Sample spindle gross weight at turn start (PRD §3.2) |
| `sample_tare_weight_g` | decimal(6,2) | That sample spindle tare weight (PRD §3.2) |
| `spindle_count` | integer | Total operative spindles (PRD §3.2) |
| `weight_input_kg` | decimal(8,2) | Input weight — what the previous turn left as output (PRD §4.1) |
| `weight_output_kg` | decimal(8,2) | Output weight — calculated by material balance (PRD §4.1) |
| `weight_download_kg` | decimal(8,2) | Sum of all discharge net weights for this turn (PRD §4.1) |
| `working_hours` | decimal(4,1) | Hours worked (PRD §4.2) |
| `comments` | text | |
| `edit_version` | integer | Default 1 (PRD YS-TR-01) |
| `created_at` | timestamptz | Default now() |

**Indexes:**

- `idx_adv_machine_date` on (`machine_id`, `date`, `shift_code`)
- `idx_adv_section_date` on (`section_id`, `date`)
- **Unique** on (`machine_id`, `shift_code`, `date`, `yarn_count_id`)

---

### 3.4 `quality_controls`

Process quality control record (PRD §5).
Quality evaluates ALL sections. Method varies by section (PRD §5.2).

**Note:** "RandomCheck" describes how the Quality inspector chooses machines in daily work — the system does NOT enforce randomness. The user decides what to test and records results. The system must be flexible: if they test 2 Twisting machines today and 5 tomorrow, the system allows it.

| Column | Type | Notes |
|---|---|---|
| `quality_control_id` | integer | PK |
| `machine_id` | varchar(20) | FK → machines.machine_id |
| `shift_code` | varchar(1) | FK → shifts.shift_code |
| `date` | date | |
| `section_id` | integer | FK → sections.section_id |
| `yarn_count_id` | integer | FK → yarn_counts.yarn_count_id |
| `inspector_id` | integer | FK → users.user_id (Quality, PRD §5.1) |
| `method` | varchar(20) | Samples, BodyKmCuts, RandomCheck (PRD §5.2) |
| `sample_values` | jsonb | Array of individual values (Samples method, PRD §5.2) |
| `cv_percent` | decimal(5,2) | Coefficient of variation (Samples, PRD §5.2) |
| `tenacity` | decimal(5,2) | Tenacity (Samples, PRD §5.2) |
| `elongation` | decimal(5,2) | Elongation (Samples, PRD §5.2) |
| `body_value` | decimal(8,2) | Body / imperfections (BodyKmCuts, PRD §5.2) |
| `kilometers_processed` | decimal(8,2) | Processed km (BodyKmCuts) |
| `cuts_per_cone` | decimal(6,2) | Cuts per cone/bobbin (BodyKmCuts, PRD §5.2) |
| `results` | jsonb | Flexible test results. For RandomCheck: the user records whatever they test, with any structure needed (PRD §5.3). |
| `comments` | text | |
| `edit_version` | integer | Default 1 (PRD YS-TR-01) |
| `created_at` | timestamptz | Default now() |

**Indexes:**

- `idx_qlty_machine_date` on (`machine_id`, `date`, `shift_code`)
- `idx_qlty_section_date` on (`section_id`, `date`)

---

### 3.5 `waste_records`

Waste record by machine group (PRD §6).
Inventory registers waste for ALL sections (PRD §6.1).

| Column | Type | Notes |
|---|---|---|
| `waste_record_id` | integer | PK |
| `machine_group_id` | integer | FK → machine_groups.machine_group_id |
| `section_id` | integer | FK → sections.section_id |
| `shift_code` | varchar(1) | FK → shifts.shift_code |
| `date` | date | |
| `weight_kg` | decimal(8,2) | Waste weight in kg (PRD §6.2) |
| `waste_type` | varchar(20) | Actual, Accumulated (PRD §6.3) |
| `registered_by_id` | integer | FK → users.user_id (Inventory, PRD §6.1) |
| `comments` | text | |
| `edit_version` | integer | Default 1 (PRD YS-TR-01) |
| `created_at` | timestamptz | Default now() |

**Indexes:**

- `idx_waste_section_date` on (`section_id`, `date`)
- `idx_waste_group_date` on (`machine_group_id`, `date`)

---

## 4. Entity-Relationship Summary

```
sections
  ├──< machines (PK = natural key: PSJ-1B, FIN-A, etc.)
  │     └──< production_discharges
  │     └──< advance_trackings
  │     └──< quality_controls
  ├──< machine_groups
  │     └──< waste_records
  └── referenced by all transaction tables (section_id)

users ──< production_discharges (supervisor_id, foreman_id)
users ──< advance_trackings (supervisor_id, foreman_id)
users ──< quality_controls (inspector_id)
users ──< waste_records (registered_by_id)
users ──< skeining_productions (supervisor_id, foreman_id)

shifts ──< all transaction tables (shift_code)
yarn_counts ──< production_discharges, advance_trackings, quality_controls, skeining_productions
```

---

## 5. Business Rules (as Constraints)

1. **Only FIN produce in Preparation** (PRD YS-PR-03): No `production_discharges`
   records for Preparation machines where `machines.machine_type != 'FIN'`.

2. **Only PSJ have advance in Preparation** (PRD §2.2): No `advance_trackings`
   records for Preparation machines where `machines.machine_type != 'PSJ'`.

3. **No advance in Winding or Skeining** (PRD §4.2): No `advance_trackings`
   records for sections with `has_advance = false`.

4. **Net weight always calculated** (PRD YS-PR-02): `net_weight_kg` is
   system-calculated. Never entered directly.

5. **Advance validates production** (PRD §4.4): `weight_download_kg` in
   `advance_trackings` must match `SUM(net_weight_kg)` of `production_discharges`
   for the same `(machine_id, shift_code, date)`.

6. **Out-of-spec skeining is NOT waste** (PRD YS-WS-03): Returns to an
   earlier stage for reprocessing.

7. **Append-only** (PRD YS-TR-01, YS-TR-02): No DELETEs. Corrections are
   new records with `edit_version > 1`.

---

## 6. Register Mapping by Section

| Section | Production | Advance | Quality | Waste | Production registrar | Advance registrar |
|---|---|---|---|---|---|---|
| Preparation (FIN) | `production_discharges` | — | `quality_controls` | `waste_records` | Quality | — |
| Preparation (PSJ) | — | `advance_trackings` | `quality_controls` | `waste_records` | — | Quality |
| Ring Spinning | `production_discharges` | `advance_trackings` | `quality_controls` | `waste_records` | Quality | Quality |
| Winding | `production_discharges` | — | `quality_controls` | `waste_records` | Unassigned | — |
| Twisting | `production_discharges` | `advance_trackings` | `quality_controls` | `waste_records` | Inventory | Inventory |
| Skeining | `skeining_productions` | — | `quality_controls` | `waste_records` | Inventory | — |

---

## 7. Related Files

- `docs/db/yarn-spinning-schema.dbml` — DBML diagram
- `docs/domain/operation/yarn-spinning.md` — Domain model
- `docs/prd/operation/yarn-spinning.md` — PRD (business requirements)
- `docs/prd/operation.md` — Operation unit PRD

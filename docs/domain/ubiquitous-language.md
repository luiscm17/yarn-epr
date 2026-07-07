# Ubiquitous Language — Naming Contract

This document defines the **canonical English naming contract** for architecture, code, APIs, database design, and cross-team technical discussions.

It is intentionally **small and stable**. It does **not** try to translate every business term in the system. It only covers terms that are easy to mistranslate, easy to overload, or likely to cause bad code names.

---

## Scope

Use this document when naming:

- bounded contexts and modules
- entities, value objects, enums, and state fields
- API contracts and DTOs
- database tables and columns
- frontend feature areas and labels for technical artifacts

If a term is not listed here, keep the nearest existing architecture/PRD wording unless a later naming decision explicitly replaces it.

---

## Canonical terms

| Spanish term | Business meaning | Canonical English term for docs | Canonical code term | Avoid / notes |
|---|---|---|---|---|
| `fardo` | Raw-material unit received from suppliers before any production lot exists | **bale** | `bale` | Avoid `bundle` or `lot`. A `fardo` is not a production lot. |
| `título` | Textile count/thickness designation of the yarn, such as `2/18` or `2/32` | **yarn count** | `yarnCount` | Avoid bare `title`; it is overloaded in software and weak in English. Keep `title` only when quoting legacy business wording. |
| `lote` | Physical batch tracked through Lot Processing and later Warehouse continuity | **lot** | `lot` | Use only for the physical batch, not for upstream raw-material reception. |
| `identidad de producción` | Cross-context business identity defined by Warehouse before the physical lot exists | **production identity** | `productionIdentity` | Do not collapse this into `lot`. The lot is born later. |
| `código de lote` | Shared identifier that travels across contexts | **lot code** | `lotCode` | The identifier may exist before the physical lot is assembled. |
| `madeja` | Skein output from Madejeras and input to lot assembly | **skein** | `skein` | Avoid leaving `madeja` in new code unless integrating with external/local terminology that must stay Spanish. |
| `devanado` | Conversion of skeins into cones for the industrial format | **winding** | `winding` | Avoid translating both `devanado` and `ovillado` as `winding`; they are different stages/variants. |
| `ovillado` | Conversion of skeins into yarn balls for direct-sale format | **ball winding** | `balling` | Avoid generic `winding`. Use a distinct term because it produces balls, not cones. |
| `embolsado` | Bagging/packing stage after winding or balling | **bagging** | `bagging` | Avoid `packaging` for the stage name unless talking about the broader packaging domain. |
| `avance` | Section-level summary record of inputs, outputs, and flow in Yarn Spinning | **progress record** | `progress` | Avoid the false friend `advance` in code. Use `progress` for the record family. |
| `descarga` | One machine-level production output event within a shift | **production discharge** | `discharge` | Avoid `download`, `unload`, or `shipment`. In this domain it is a production event. |
| `desperdicio` | Material loss or discard recorded by context/stage | **waste** | `waste` | Use qualifiers when needed: `realWaste`, `accumulatedWaste`, `theoreticalWaste`. |
| `observado` | Product or lot with documented issues that require review or conditional handling | **flagged** | `flagged` | Avoid literal `observed`; in English software/domain language that sounds passive and unclear. |
| `defectuoso` | Product classified as significantly defective in Warehouse handling | **defective** | `defective` | Keep separate from `waste`; defective product is not automatically waste. |
| `disponibilidad` | Warehouse readiness for use, distribution, or release | **availability** | `availability` | Do not use this as a synonym for stock quantity. Availability is an operational state, not a balance. |
| `disposición` | Warehouse handling/disposition decision for received PT | **disposition** | `disposition` | Keep separate from quality and presentation. |
| `presentación` | Physical form in which PT is stored or handled, such as bagged/bulk or cone/ball form | **physical presentation** | `presentation` | Avoid generic `presentation` when the surrounding context is unclear; prefer `physicalPresentation` in shared/public schemas. |
| `Inventario` (rol / etapa en Operación) | Operational role and first stage in Lot Processing where the physical lot is assembled | **Inventory stage / Inventory operator** | `inventoryStage`, `inventoryOperator` | Never use bare `inventory` to mean Warehouse stock in the same model. |
| `inventario` / `existencias` (Almacén) | Warehouse stock, balances, and custody quantities | **stock** | `stock` | Prefer `stock` for Warehouse quantities. Reserve `inventory` for the Operation role/stage or clearly qualified technical names. |

---

## Canonical section and stage names

Use these names for **operation section/stage identifiers** so process names stay stable across docs, code, APIs, and tables.

| Spanish name in business docs | Scope | Canonical English name for docs | Canonical code term | Avoid / notes |
|---|---|---|---|---|
| `Preparación` | Yarn Spinning section | **Preparation** | `preparation` | Keep the Spanish business label visible in PRDs when useful, but do not shorten to `prep` in shared models. |
| `Continuas` | Yarn Spinning section | **Ring Spinning** | `ringSpinning` | Avoid literal `continuous` / `continuing`; the business section maps to ring spinning. |
| `Bobinados` | Yarn Spinning section | **Bobbin Winding** | `bobbinWinding` | Avoid bare `winding`; that would collide with `Devanado`. Keep `Bobinados` visible in docs when referring to the plant section name. |
| `Retorcido` | Yarn Spinning section | **Twisting** | `twisting` | Avoid `twisted` as a stage name. |
| `Madejeras` | Yarn Spinning section | **Madejeras (`Skeining`)** | `skeining` | Keep **Madejeras** visible in docs because it is the plant section name. Use `skeining` in code. |
| `Inventario` | Lot Processing stage | **Inventory stage** | `inventoryStage` | Do not reuse this for Warehouse stock. If a very local enum already sits inside Lot Processing, `inventory` is acceptable only when no stock collision exists. |
| `Tintorería` | Lot Processing stage | **Dyeing** | `dyeing` | Avoid `tinting`; it is the wrong production term here. |
| `Secado` | Lot Processing stage | **Drying** | `drying` | Keep it distinct from generic completion or cooldown states. |
| `Devanado` | Lot Processing stage / variant | **Winding** | `winding` | This is the canonical `winding` term in Lot Processing. Do not reuse `winding` for `Bobinados`. |
| `Ovillado` | Lot Processing stage / variant | **Ball Winding** | `balling` | Keep separate from `Devanado`; they produce different physical presentations. |
| `Embolsado` | Lot Processing stage | **Bagging** | `bagging` | Avoid `packaging` as the stage name unless discussing the broader packaging domain. |
| `Calidad` | Process-wide function / final Lot Processing stage | **Process Quality** / **Quality stage** | `processQuality`, `lotQuality` | `Calidad` is overloaded. Use `processQuality` for cross-section quality in Yarn Spinning and `lotQuality` for the final lot stage. Keep the Spanish label visible in docs when needed. |

---

## Canonical identifier roles

Use these identifiers consistently across docs, code, APIs, and database design.

| Business concept | Canonical doc term | Canonical code term | Meaning | Rule |
|---|---|---|---|---|
| Visible lot/business code | **lot code** | `lotCode` / `lot_code` | Human-visible code used by operators and business users to track the lot across contexts | Use for business navigation and traceability. Do not use it as the local technical primary key. |
| Warehouse production identity technical ID | **production identity ID** | `productionIdentityId` / `production_identity_id` | Internal technical identifier of the Warehouse-owned production identity record | Use for Warehouse ownership and technical references to the Warehouse identity. |
| Physical lot technical ID | **lot ID** | `lotId` / `lot_id` | Internal technical identifier of the Lot Processing physical lot record | Use only for the Lot Processing aggregate and its owned records. |
| Physical batch technical ID | **batch ID** | `batchId` / `batch_id` | Optional synonym only when a local model truly names the physical lot as a batch | Do not use together with `lotId` for the same concept in one model. Prefer `lotId` in current artifacts. |

### Stable rule

- `lotCode` is the visible shared business code.
- `productionIdentityId` is the Warehouse technical ID.
- `lotId` / `batchId` is the Lot Processing technical ID for the physical lot.
- Never use `_ref` naming when the column actually stores one of these technical IDs.

---

## Intentional distinctions

### Production identity vs lot

- **Production identity** = the Warehouse-defined cross-context identity.
- **Lot** = the physical batch assembled later in the Inventory stage.
- **Lot code** = the visible business code shared across contexts.
- **Production identity ID** = the internal Warehouse technical ID.
- **Lot ID** = the internal Lot Processing technical ID.

These must never be merged into one premature model.

### Yarn count vs title

- In business conversations, people may still say **título**.
- In technical English artifacts, prefer **yarn count**.
- In code, prefer `yarnCount`.

### Inventory vs stock

- In **Lot Processing**, `inventoryStage` and `inventoryOperator` are valid.
- In **Warehouse**, balances and custody should prefer **stock** terminology.

This is a hard rule to avoid one of the worst naming collisions in the current docs.

### Flagged vs defective

- **flagged** = requires review, conditions, or follow-up.
- **defective** = a stronger classification used for materially defective PT.

They are not interchangeable state names.

---

## How to use this contract

### Architecture

- Use the **canonical English term for docs** in architecture narratives.
- When a distinction is boundary-critical, prefer the fuller phrase even if code stays shorter (for example, **production identity** vs **lot**).

### Backend

- Use the **canonical code term** for entities, fields, enums, ports, repositories, and module-internal names.
- If a field lives in a very broad/shared schema, expand ambiguous short names when needed (for example `physicalPresentation` instead of `presentation`).

### Frontend

- Use the same code terms for feature modules, API clients, and state models.
- UI copy may follow business wording, but internal model names should still follow this contract.

### Database

- Prefer stable noun-based names from the **canonical code term** column.
- Do not encode Spanish synonyms and English synonyms for the same concept in different tables or columns.

---

## Non-goals

- This is not a full business glossary.
- This does not replace the PRDs.
- This does not redefine bounded-context ownership.

It only stabilizes naming so later design and implementation stop drifting.

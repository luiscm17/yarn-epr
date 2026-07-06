# Warehouse Schema Design

This document defines the Warehouse context schema-design baseline. It stays **above SQL and ORM mapping** while making Warehouse persistence boundaries, record families, and identity rules concrete.

---

## 1. Purpose and scope

This artifact defines the schema-design baseline for the **Warehouse** context under `backend/warehouse/`.

It covers:

- translate Warehouse PRD and backend decisions into conceptual persistence structure
- identify the record families represented in Warehouse persistence
- lock the identity, time, correction, and separation rules for Warehouse persistence

It does **not** define:

- SQL
- exact tables or columns
- foreign keys
- indexes
- ORM classes

Catalogs and other contexts are intentionally out of scope here except where Warehouse must reference them.

---

## 2. Related documents

| Artifact | Role |
|---|---|
| [`../persistence-design-principles.md`](../persistence-design-principles.md) | Shared persistence rules for all contexts |
| [`../persistence-decisions.md`](../persistence-decisions.md) | Stable persistence decisions used by Warehouse |

---

## 3. Warehouse persistence boundary

Warehouse persists only the records whose business meaning it owns:

- raw-material reception as **bales**
- production identity definition
- raw-material emission to production
- finished-product reception from Operation
- warehouse availability/disposition decisions for PT
- PT physical presentation changes under warehouse custody
- PT exits and returns
- production-supply movements
- warehouse stock closures and warehouse-side audit history

Warehouse does **not** persist as its own write model:

- Yarn Spinning production records
- physical lot stage history from Lot Processing
- Operation quality execution details beyond the handoff/result Warehouse receives

### Boundary consequence

Warehouse may store references and snapshots from Operation for evidence and readability, but it must not absorb Lot Processing stage history into Warehouse-owned write records.

---

## 4. Conceptual record families

These are **conceptual persistence families**, not tables.

| Record family | Represents | Identity anchor | Notes |
|---|---|---|---|
| **Bale reception** | Physical reception of raw material from suppliers | `baleReceptionId` + visible reception number | Reception is separate from later production identity |
| **Bale item / bale unit** | Individual bale or controllable received unit | `baleId` | Needed if traceability must reach the bale level |
| **Production identity** | Business identity defined after bale reception | `productionIdentityId` + visible `lotCode` | Separate business act from bale reception |
| **Production identity source allocation** | Relationship from production identity to source bale stock | allocation ID or composite relation | Supports grouped or detailed allocation models |
| **Material emission** | Warehouse emission of raw material to production | `materialEmissionId` + visible emission number | Stock movement plus production handoff |
| **Finished-product reception** | Warehouse intake of PT returning from Operation | `finishedProductReceptionId` + production identity reference | Continues the shared identity without taking Lot Processing ownership |
| **PT availability/disposition history** | Warehouse operational classification of PT | `ptDispositionRecordId` | Must stay separate from Operation quality state |
| **PT physical presentation history** | Changes in how PT is stored/handled | `ptPresentationRecordId` | Separate from quality and disposition |
| **PT exit** | Sale or transfer out of Warehouse custody | `ptExitId` + visible exit number | References PT under existing production identity |
| **PT return** | Total or partial return after a PT exit | `ptReturnId` + visible return number | Must reference original PT exit |
| **Supply movement** | Entries/exits for production supplies | `supplyMovementId` + visible movement number | Separate lifecycle from production identity / PT |
| **Stock closure / balance snapshot** | Period closure and balance evidence | `stockClosureId` | Supports monthly, annual, and extraordinary closure |
| **Warehouse correction audit** | Correction history for Warehouse-owned records | `auditEntryId` | Tracks before/after, actor, reason, scope, system time |

---

## 5. Identity strategy in Warehouse

### 5.1 General rule

Warehouse persistence should use **internal technical IDs** for write-model integrity and **separate visible business codes** for operator navigation, document matching, and cross-context business references.

This follows the agreed contract from [`../persistence-decisions.md`](../persistence-decisions.md).

### 5.2 Bales

- A bale reception has its own Warehouse identity.
- Individual bales or controllable received units should keep their own technical identity when bale-level traceability is required.
- Visible reception numbers remain separate from internal IDs.
- A bale is **not** a production lot and must never reuse lot semantics.

### 5.3 `productionIdentity`

- `productionIdentity` is a Warehouse-owned concept created **after** bale reception.
- It needs its own internal ID.
- The visible business code (`lotCode` or equivalent future code) remains separate from the technical ID.
- Downstream contexts may reference the shared business code, but that does not remove Warehouse ownership of the identity definition.

### 5.4 PT records

- PT reception, availability/disposition, presentation, exits, and returns should reference the Warehouse production identity.
- PT records may also snapshot visible descriptors such as yarn count, color, client/destination, and received quality wording when those values are part of the business evidence at the time of the record.
- PT records must not use PT movement IDs as a replacement for the upstream `productionIdentity` anchor.

### 5.5 Returns

- A PT return is a new Warehouse record family with its own identity.
- It must reference the original PT exit.
- It must not create a new production identity.
- Partial returns should remain traceable against the original exit scope.

### 5.6 Supplies

- Supplies use their own movement identity model.
- Supply movements are Warehouse-owned, but they are not part of the production-identity / PT lifecycle.
- Supply items should reference catalogs and units of measure without inheriting lot identity semantics.

---

## 6. Write-model vs read-model notes

### Warehouse write model

Warehouse should keep separate write-model families for:

- bale reception
- production identity
- material emission
- finished-product reception
- PT disposition/history
- PT presentation/history
- PT exits and returns
- supply movements
- stock closures

### Cross-context read models

Warehouse needs read models for:

- end-to-end traceability across Warehouse → Yarn Spinning → Lot Processing → Warehouse
- stock reconciliation against production handoffs
- PT lifecycle review from reception to exit/return

### Non-negotiable rule

Read models may unify lifecycle visibility, but they must remain rebuildable from owning write models and must not become the canonical target for Warehouse corrections.

---

## 7. Correction and audit implications

Warehouse schema design must support **controlled edits with audit trail**, not silent overwrite and not SQL-first append-only assumptions.

Implications:

- each Warehouse record family needs a clear current-state persistence path
- corrections need separate audit history preserving before/after values
- audit entries must preserve actor, reason, authorization basis/scope when relevant, and system timestamp
- operational correction windows and elevated SysAdmin edits must be enforceable without losing current business truth
- Warehouse corrections must never mutate Operation-owned stage history; they only correct Warehouse-owned records and Warehouse-side interpretations

Important distinction:

- correcting a PT reception discrepancy is a Warehouse act
- correcting a lot stage history entry is a Lot Processing act

---

## 8. Time fields principles for Warehouse

Warehouse persistence should explicitly model the time concepts that the PRDs separate.

| Time concept | Why it matters in Warehouse | Principle |
|---|---|---|
| **business date** | Movement belongs to an operational day/period | Store as business data |
| **business shift** | Relevant for handoff, reception, and correction context when shift matters | Store explicitly where the record meaning depends on it |
| **physical movement datetime** | The business fact may happen before digital registration | Preserve the actual occurrence time when the movement model requires it |
| **system created timestamp** | Audit and traceability | Capture automatically |
| **system updated/corrected timestamp** | Controlled-edit history | Capture automatically and independently from business time |

### Practical rules

- Do not infer business date from `created_at`.
- Do not collapse physical movement time into audit timestamps.
- When the user records a movement later, the model should preserve both the business/physical time and the system capture time.
- Shift should not be stored as a free-text note when it affects traceability, reconciliation, or correction policy.

---

## 9. What must remain separate in persistence

Warehouse schema design must preserve these as **different dimensions**, even when the same PT identity is involved:

| Dimension | Owned by | Meaning |
|---|---|---|
| **quality state** | Operation reports it; Warehouse stores it as received/reference context | Delivery quality condition at the handoff from Operation |
| **availability / disposition** | Warehouse | Whether PT is available, flagged, available with condition, defective, dispatched, or otherwise controlled for Warehouse action |
| **physical presentation** | Warehouse | How PT is physically stored/handled, such as bagged, bulk, cone, or ball form |

### Design consequence

These dimensions must not collapse into one shared `status` concept. They may interact in workflows, but they should remain independently queryable, auditable, and correctable.

---

## 10. Out of scope

This document does **not** define:

- SQL
- exact tables or columns
- foreign keys
- indexes
- ORM classes
- conceptual attributes and relationships for individual record families

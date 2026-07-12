# Yarn EPR — Persistence Decisions

> Canonical persistence decisions for backend data design.

---

## 1. Correction and audit decisions

| Decision | Rule |
|---|---|
| Business truth | The current business record may be corrected under policy rather than replaced by append-only duplicate records. |
| Audit persistence | Every correction preserves actor, system time, reason, authorization basis when relevant, and before/after values. |
| Ownership | Each bounded context owns the correction history of its own records. |
| Storage shape | Audit follows a shared pattern, but remains persisted in separate context-owned audit tables. |

---

## 2. Identifier decisions

| Scope | Identifier | Rule |
|---|---|---|
| Warehouse | `productionIdentityId` | Internal technical ID of the Warehouse-owned production identity. |
| Cross-context business navigation | `lotCode` | Visible business code shared across contexts for operator recognition and traceability. |
| Lot Processing | `productionIdentityId` | Reference to the Warehouse-defined single lot identity used by every stage record. |
| Cross-context links | `productionIdentityId` and `lotCode` | The technical ID links records to the same lot; the visible code supports operator recognition and traceability. |

### Stable rule

- The Warehouse-owned `productionIdentityId` is the single technical lot identity across Warehouse and Lot Processing records.
- Visible business codes remain separate from technical IDs.
- `lotCode` does not replace `productionIdentityId`.
- If a column stores a technical identifier, name it with `_id`.
- If a column stores a visible business identifier, name it with `_code` or another explicit visible-number/code term.

---

## 3. Snapshot and reference decisions

| Area | Decision |
|---|---|
| Production identity | Snapshot business-defining descriptors such as yarn count, color requirement, destination/client, and request notes when they are part of the meaning of the identity. |
| Bale custody | Preserve receipt evidence and whole-bale delivery responsibility; bales do not link to production identities or finished-product lots. |
| Lot stage records | Keep inherited references explicit and snapshot the values that the stage actually received, verified, or produced. |
| PT handoff and reception | Preserve the one permitted Quality Send marker and exact send timestamp separately from Warehouse's later acceptance. A pending handoff is that singular marker with no Warehouse receipt for the same `productionIdentityId`; it needs no timestamp tie-breaker. The receipt does not duplicate quality state or re-enter lot weight, bag count, or unit count. |
| Shared catalogs | Keep only references when the catalog remains authoritative and the historical wording is not itself business evidence. |

### Stable rule

- Snapshot values that preserve historical meaning, evidence, or operator-readable context.
- Keep only references where canonical lookup data remains authoritative and current synchronization matters more than historical wording.
- Catalog changes must not silently rewrite past business facts.

---

## Related documents

- [Backend Architecture](../backend.md)
- [Backend Technical Design Baseline](./backend-technical-design.md)
- [Persistence Design Principles](./persistence-design-principles.md)

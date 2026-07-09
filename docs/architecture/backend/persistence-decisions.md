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
| Lot Processing | `lotId` | Internal technical ID of the physical lot aggregate. |
| Cross-context links | technical IDs and visible codes | Technical IDs support ownership and explicit integration. Visible codes support shared business traceability. |

### Stable rule

- Internal technical IDs remain local to the owning write model.
- Visible business codes remain separate from technical IDs.
- `lotCode` does not replace `productionIdentityId` or `lotId`.
- `lotId` is the canonical technical identifier for the physical lot.
- If a column stores a technical identifier, name it with `_id`.
- If a column stores a visible business identifier, name it with `_code` or another explicit visible-number/code term.

---

## 3. Snapshot and reference decisions

| Area | Decision |
|---|---|
| Production identity | Snapshot business-defining descriptors such as yarn count, color requirement, destination/client, and request notes when they are part of the meaning of the identity. |
| Bale allocation | Keep explicit technical links to source bales and snapshot enough bale descriptors for historical readability. |
| Lot stage records | Keep inherited references explicit and snapshot the values that the stage actually received, verified, or produced. |
| PT handoff and reception | Snapshot quality wording, delivery conditions, and physical presentation details that must remain historically readable after handoff. |
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

# Yarn EPR — Persistence Decisions

> Canonical persistence decisions for backend data design.

---

## 1. Correction + audit model

Critical business records are editable under policy, not append-only by default and not silently overwritten.

| Decision point | Rule |
|---|---|
| Controlled edits | The owning context may correct the current business record when policy allows it. |
| Operational window | Normal corrections are allowed only inside the context's operational correction window. |
| Outside the window | Only **SysAdmin** may edit outside the operational window. |
| Audit history | Every correction must preserve who changed it, when, why, under which authorization scope, and the before/after values. |

### Stable rule

- Keep **current business truth** and **correction history** as separate concerns.
- Do not use silent overwrite.
- Do not force every correction into append-only replacement records.

---

## 2. ID / reference strategy

Visible business codes and internal technical IDs are separate by default.

| Decision point | Rule |
|---|---|
| Internal IDs | Production identity and physical lot records use stable internal technical IDs in their own write models. |
| Visible codes | Business-facing codes remain separate visible identifiers and must not replace internal IDs. |
| Cross-context references | Cross-context integration uses explicit references to the owning context's shared business identifier when that identifier is part of the business contract. |
| Local ownership | A context keeps its own internal IDs local for its write model even when a shared business code also exists. |

### Stable rule

- Use **internal IDs** for technical identity and local persistence integrity.
- Use **visible business codes** for business navigation, operator recognition, and cross-context references when the code is intentionally shared.
- A shared code is a **reference**, not proof of shared ownership.

---

## 3. Snapshot vs live reference policy

Persist snapshots only when later source changes would rewrite business meaning or audit evidence.

| Decision point | Rule |
|---|---|
| Snapshot | Snapshot labels, descriptions, and business-critical values when they were part of the decision, evidence, or meaning of the record at registration time. |
| Live reference only | Store only a reference when the source remains authoritative and the consuming context only needs linkage, validation, or the latest value. |
| History protection | Historical records must not be rewritten just because catalogs, labels, or upstream descriptive values later change. |
| Readability | Snapshot enough business-facing context to keep historical records understandable without depending on today's catalog values. |

### Stable rule

- Snapshot business-critical descriptors such as labels, descriptions, client-facing values, and condition descriptors **when historical meaning must be preserved**.
- Keep only references for purely canonical lookup data **when current synchronization matters more than historical wording**.
- Treat catalog evolution as a source change, not as permission to rewrite past business facts.

---

## Related documents

- [Backend Architecture](../backend.md)
- [Backend Technical Design Baseline](./backend-technical-design.md)
- [Persistence Design Principles](./persistence-design-principles.md)

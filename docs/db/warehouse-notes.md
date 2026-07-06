# Warehouse Notes

> Canonical schema: [`warehouse.dbml`](./warehouse.dbml)

This note keeps only Warehouse decisions that DBML does not express cleanly.

## Stable decisions

- **Bale vs production identity:** a bale is a received raw-material unit under Warehouse custody; a production identity is the later Warehouse business identity that is defined after reception and before Operation creates the physical lot.
- **Identifier roles:** `lot_code` is the visible shared business code; `production_identity_id` is the internal technical ID of the Warehouse production identity; downstream contexts must keep those roles explicit instead of treating them as interchangeable.
- **Authoritative bale allocation:** `production_identity_bale_allocations` may capture planning/reference linkage, but stock commitment becomes authoritative only through `material_emission_allocations` at emission time.
- **Separate PT state dimensions:** keep Operation quality state, Warehouse availability/disposition, and Warehouse physical presentation as different dimensions. They must not collapse into one shared status.
- **Corrections and audit:** Warehouse records keep editable current state under policy, and every correction must leave audit evidence with reason, actor, authorization scope when relevant, and before/after payloads.

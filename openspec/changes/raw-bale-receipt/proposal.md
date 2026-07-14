# Proposal: Receive Raw-Material Bale

## Intent

Define the first Warehouse capability for recording one raw-material bale entering custody. It protects user-entered identity and receipt facts without creating Production, lot, stock, delivery, or approval workflow concerns.

## Scope

### In Scope

- Warehouse-owned `ReceiveRawMaterialBale` act for one bale per command.
- Required facts: unique user-entered `bale_number`; required Warehouse `raw_material_type` enum with no invented members; positive user-entered kilograms preserving precision without business rounding; and receipt time.
- Optional supplier, document, truck, yarn-count, color, and notes evidence, retained when supplied.
- Initial Warehouse custody state of `not_delivered`, plus application authorization and audit/RBAC context through ports. The recording user is not a business bale attribute.

### Out of Scope

- Delivery transition/time; Production identity, lot, stock balances, corrections, generic CRUD, and bale listing/query behavior.
- Receiving-actor fields, digitized bale-emission approval, multi-bale supplier-document orchestration, HTTP/UI, persistence, authentication providers, retries, and idempotency.

## Capabilities

### New Capabilities

- `raw-bale-receipt`: Receive one raw-material bale into Warehouse custody through a domain-first application contract.

### Modified Capabilities

None — no existing OpenSpec capabilities exist.

## Approach

Model Warehouse invariants first, then expose an application command/result through ports. Validate identity and receipt facts, preserve supplied evidence and entered kilograms, authorize before commit, and initialize `not_delivered`. Keep domain policy independent of transport, persistence, UI, and Access Control implementation. Later delivery owns the transition/time; later queries own lists.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `openspec/changes/raw-bale-receipt/specs/raw-bale-receipt/spec.md` | New | Normative Warehouse receipt contract. |
| `docs/prd/warehouse/warehouse-records.md` | Referenced | Receipt evidence, business time, and later delivery. |
| `docs/domain/warehouse.md` | Referenced | Bale custody and Production separation. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Future multi-bale documents reshape the boundary | Med | Keep document evidence optional; preserve bale identity and custody semantics. |
| Weight precision is lost through implementation choices | Med | Require precision preservation; defer numeric representation to implementation. |
| Delivery or emission approval leaks into receipt | Med | Keep each as an explicit later capability; audit/RBAC is not business approval. |

## Rollback Plan

Withdraw this contract and retain existing Warehouse behavior. This proposal introduces no schema, route, or persisted-data change.

## Dependencies

- Warehouse write-authorization/audit context port.
- A source of valid Warehouse raw-material enum values when authoritative domain work defines them.

## Success Criteria

- [ ] A valid bale receipt preserves its entered number and kilogram precision, records receipt time, and initializes `not_delivered`.
- [ ] Duplicate numbers, missing/invalid required facts, and denied authorization create no receipt.
- [ ] The contract contains no receiving actor, delivery transition/time, listing/query, digitized emission approval, Production, lot, balance, transport, persistence, or UI concern.

# Design: Receive Raw-Material Bale

## Technical Approach

Implement one Warehouse write capability around a `RawMaterialBale` aggregate. The domain establishes receipt facts and initial custody; an application use case coordinates authorization, uniqueness, creation, and atomic commit through outbound ports. Adapters remain later choices. This follows the approved one-bale, transport-neutral specification and does not define implementation layout.

## Architecture Decisions

| Decision | Alternatives considered | Choice and rationale |
|---|---|---|
| Aggregate boundary | A receipt aggregate containing many bales; a generic inventory movement | One bale is one aggregate root and consistency boundary. The approved command and result are one-bale operations; grouping and balances have different lifecycles and must not enlarge this transaction. |
| Invariant ownership | Put all checks in the use case or repository | The aggregate owns intrinsic validity: required receipt facts, positive entered kilograms without business rounding, valid Warehouse material type, Warehouse custody, and initial `not_delivered`. The application and repository collaboration enforce Warehouse-wide bale-number uniqueness because it spans aggregates. |
| Access collaboration | Reimplement roles in Warehouse; embed actor as bale data | Use one outbound authorization/audit context port. Access Control owns policy evaluation; Warehouse supplies only the action and authenticated context, receives permit/deny plus opaque audit context, and never stores the registrant as a business bale attribute. |
| Persistence boundary | Generic CRUD repository; schema-led model | Use a capability-focused repository port plus transaction boundary. This protects domain language, prevents overwrite/upsert semantics, and leaves persistence technology undecided. |
| Consumer contract | HTTP-shaped DTOs or framework exceptions | Define a transport-neutral command, accepted result, and closed business-error set so later API and frontend adapters translate rather than redefine behavior. |

## Data Flow

```text
Command + authenticated context
        |
        v
Receive use case --> authorization/audit port --> permit or denial
        |
        +--> repository: check/reserve bale-number uniqueness
        |
        +--> domain: create valid RawMaterialBale
        |
        `--> transaction: add aggregate + audit context --> commit
                                      |
                                      `--> accepted result
```

The transaction begins before the uniqueness decision and ends after the aggregate is added. A concurrent duplicate must resolve to `DUPLICATE_BALE_NUMBER`; commit failure exposes no partial receipt. Provider or infrastructure failures are operational failures, not new business error codes.

## Aggregate and Domain Concepts

`RawMaterialBale` is the Warehouse aggregate root and only entity in this capability. Its identity is technical; `bale_number` is the unique user-entered business identity. Domain value concepts describe bale number, material type, entered kilogram weight, receipt business time, custody/delivery state, and optional receipt evidence. They should preserve meaning and validation without requiring a particular class model, numeric representation, or file organization.

Optional supplier, document, truck, yarn-count, color/fiber, condition, notes, and receipt-reference evidence belongs to the bale snapshot when supplied. It does not create supplier-document or receipt grouping ownership.

## Interfaces / Contracts

**Command:** bale number, Warehouse raw-material type, positive entered kilograms, receipt business time, and optional evidence. Authenticated identity is invocation context, not command data.

**Accepted result:** aggregate identity and accepted receipt facts, including `not_delivered`; excludes actor, delivery date, Production identity, lot, balances, and query projections.

**Business errors:** `INVALID_RECEIPT_FACTS`, `DUPLICATE_BALE_NUMBER`, `AUTHORIZATION_DENIED` only.

**Repository port responsibilities:** determine whether a bale number is already owned, add one new aggregate, and participate in the application transaction. It must not expose listing, correction, deletion, generic update, ORM, or storage-schema concerns. The eventual adapter must make concurrent uniqueness enforcement authoritative.

## File Changes

| File | Action | Description |
|---|---|---|
| `openspec/changes/raw-bale-receipt/design.md` | Create | Design only; no implementation paths are prescribed. |

## Testing Strategy

| Layer | What to test | Approach |
|---|---|---|
| Domain | Required facts, material type, positive precision-preserving weight, optional evidence, initial custody | Pure examples around aggregate creation and invariant rejection. |
| Application | Denial, duplicate, success, concurrent duplicate, atomic commit failure, exact result/errors | Use port fakes and a controllable transaction; assert no mutation on rejection/failure. |
| Adapter contracts | Repository uniqueness/atomicity and Access decision translation | Reuse behavioral contracts against each future adapter; no HTTP, UI, or end-to-end design here. |

## Manual Implementation Order

1. Define domain behavior and value concepts.
2. Implement the receive use case and transaction orchestration.
3. Define repository, transaction, and authorization/audit outbound ports.
4. Add domain, application, and port-contract tests.
5. Implement adapters separately, translating without changing the core contract.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required by this theoretical design. Persistence rollout is deferred to adapter design.

## Future Capabilities Kept Separate

Bale delivery and its business date; delivered-status list/query views; controlled correction; multi-bale/document grouping; and bale-emission business approval each require separate policy and contracts. Access permission to record a receipt is not emission approval.

## Open Questions

None blocking. The authoritative Warehouse raw-material enum members remain intentionally deferred.

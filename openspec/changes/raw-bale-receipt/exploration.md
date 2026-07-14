# Exploration: Raw-Material Bale Receipt

## Current State

Warehouse owns the physical receipt of raw material as **bales**, before any
production identity or lot exists. The authoritative Warehouse records describe
a broader receipt family, but this change remains deliberately limited to one
bale per command. The current Warehouse persistence projection groups bale
identity, receipt evidence, and initial custody facts; delivery is a distinct
later act and is not populated at receipt.

The domain-first capability should therefore define a
`ReceiveRawMaterialBale` use case that records one bale entering Warehouse
custody. It must preserve these boundaries:

- `bale` is distinct from production identity and `lot`;
- `bale_number` is a visible, user-entered code taken from supplier receipt
  evidence and is unique within Warehouse;
- receipt time is distinct from later delivery time;
- the authenticated/authorized user is application audit/RBAC context, not a
  bale attribute, editable domain input, or receiving/receiver concept;
- operational approval of bale emission is a separate real-world action and is
  not digitized by this capability.

No production identity, lot code, delivery transition, stock balance, listing
query, HTTP route, persistence mechanism, or authentication provider is needed
to define this command.

## Affected Areas

- `docs/prd/warehouse/warehouse-records.md` — defines physical bale receipt,
  receipt evidence, business time, and later delivery as separate acts.
- `docs/prd/warehouse.md` — defines Warehouse ownership, kilogram control,
  configurable authorization, and correction/audit boundaries.
- `docs/architecture/context-boundaries-and-ownership.md` — establishes
  Warehouse ownership and the Access Control boundary.
- `docs/domain/warehouse.md` — confirms bale custody and separation from
  production identity, lot, and later operations.
- `docs/domain/ubiquitous-language.md` — keeps `bale`, `yarnCount`, `lot`, and
  `productionIdentity` distinct.
- `docs/db/warehouse.dbml` and `docs/db/warehouse-dictionary.md` — provide the
  current persistence projection, but do not prescribe the domain contract.
- `docs/plan/spec-roadmap.md` — identifies raw-bale reception and later stock
  capabilities in Warehouse.
- `backend/auth/domain/check_access.py` and related Access Control code — show
  authorization concepts; the receipt capability must depend on an application
  authorization port rather than couple Warehouse to this implementation.

## Decisions Required for a Coherent Spec

### Receipt operation

The first use case represents **one physical bale received into Warehouse
custody**. It creates one bale record and one receipt fact. A multi-bale
document/header is deferred; supplier/document references remain optional
evidence attached to the bale rather than a reason to introduce a receipt
aggregate here.

### Bale identity and required facts

Required business facts are:

- `bale_number`: visible code entered by the user from supplier receipt
  evidence; unique within Warehouse;
- `raw_material_type`: required Warehouse-domain enum; the enum values remain
  unspecified until authoritative domain work defines them;
- received weight: user-entered, positive kilograms; entered precision must be
  preserved without business rounding. The domain spec must not prescribe
  binary floating point or a persistence type;
- receipt time: the physical time at which Warehouse receives the bale.

Optional supplier/document/truck/yarn-count/color/notes evidence may remain
optional and may be retained when supplied. No optional evidence is a domain
failure merely because it is absent.

### Initial custody and later delivery

Successful receipt establishes the bale under Warehouse custody and initializes
`not_delivered`. This capability records receipt time only. Delivery time and
the transition to delivered belong to a later delivery use case; no delivery
actor, Production receiver, or delivery timestamp is part of the receipt
command or result.

Showing existing, delivered, or undelivered bales is a separate query
capability. It must not expand this command specification into listing or query
UI behavior.

### Actor, authorization, and approval

There is no business `receiving_actor` attribute on the bale. The authenticated
and authorized user who records the fact belongs to application audit/RBAC
context. The application obtains that context through ports and requests
authorization before commit; the Warehouse domain does not own roles, scopes,
sessions, or authentication claims.

Operational approval of bale emission exists in the real-world process, but it
is not digitized in this capability. Do not model it as receipt approval or add
an approval workflow to this command.

### Duplicate identity and correction

`bale_number` is the business identity and MUST be unique. A second receipt
with the same code is rejected as a business conflict; it must not overwrite,
merge, or silently replay the existing fact. Receipt creation is not an update
command. Future corrections must be separate, controlled, auditable, and
policy-governed, with the original fact and correction context retained.

### Use-case contract and errors

The contract should remain independent of HTTP or frontend implementation.

**Command — `ReceiveRawMaterialBale`**

- required: `bale_number`, `raw_material_type`, positive received kilograms,
  and physical receipt time;
- optional: supplier, document, truck, yarn-count, color, and notes evidence;
- application context: authenticated user/audit and authorization decision,
  plus system capture time supplied by the application boundary.

**Result — `RawMaterialBaleReceipt`**

- technical bale-record identity;
- visible `bale_number`, required physical facts, and supplied evidence;
- Warehouse custody state initialized to `not_delivered`;
- receipt time and system capture time;
- no receiving actor attribute, delivery time, Production identity, lot,
  balance, or listing/query concern.

**Business/application errors** may include duplicate bale identity, invalid
receipt facts, and authorization denial. The frontend projection may expose
stable categories without introducing transport envelopes or persistence fields.

## Approaches

1. **Bale-centered receipt use case (recommended)** — receive exactly one bale,
   retain optional evidence, initialize `not_delivered`, and defer delivery,
   queries, multi-bale grouping, and emission approval.
   - Pros: matches the clarified business slice; protects DDD/Hexagonal
     ordering; preserves bale/lot and receipt/delivery boundaries.
   - Cons: a later batch or listing capability needs its own contract.
   - Effort: Low

2. **Receipt-header aggregate with delivery/query concerns** — model a
   document header, multiple bales, later delivery state, and listing behavior
   together.
   - Pros: could resemble a future operational screen.
   - Cons: expands the command beyond its business act; introduces premature
     aggregate, query, delivery, and workflow decisions.
   - Effort: High

## Recommendation

Proceed with the bale-centered use case. Specify required Warehouse facts and
invariants first, represent `raw_material_type` as a Warehouse enum without
inventing values, preserve entered weight precision, and use application
ports for audit/RBAC authorization. Keep delivery, listing queries, emission
approval, production identity, stock, HTTP, persistence, and authentication
outside this change.

## Risks

- The broader PRD describes multi-bale receipt granularity; a future batch
  workflow must compose with one-bale identity and custody semantics.
- Existing persistence projections may tempt implementers to choose a numeric
  type or round weight; the domain contract must preserve precision without
  prescribing storage technology.
- Existing PRD wording uses operational receiver/actor concepts for later
  movements; this receipt must not reintroduce them as bale attributes.
- Access Control vocabulary may differ across implementations; use an
  application authorization port and keep authorization separate from real-
  world emission approval.
- Delivery/listing work will need a later read/write contract that consumes the
  initial `not_delivered` state without changing receipt semantics.

## Ready for Proposal

Yes. The next phase can update or validate the focused proposal and normative
spec around this clarified domain boundary. It should preserve DDD/Hexagonal
ordering and all prior exclusions, while removing receiving-actor input and
delivery/query/approval concerns from the receipt command.

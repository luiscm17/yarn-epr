# Raw Bale Receipt Specification

## Purpose

Define the first, domain-first Warehouse capability for receiving one physical raw-material bale before Production, delivery, or balances.

## Requirements

### Requirement: Warehouse RawMaterialBale Record

Warehouse MUST create exactly one `RawMaterialBale` record for each accepted one-bale operation. The command MUST include a user-entered `bale_number` from receipt evidence, a required Warehouse `raw_material_type` enum, received weight in kilograms greater than zero, and receipt business time. Enum members are intentionally unspecified. Optional supplier, document, truck, yarn-count, color/fiber, condition, notes, and receipt-reference evidence MAY be retained when supplied.

#### Scenario: Receive one valid bale

- GIVEN authorization permits the operation and required facts use an unused bale number
- WHEN the one-bale command is accepted
- THEN Warehouse creates one `RawMaterialBale` record
- AND it retains supplied optional evidence without requiring it

#### Scenario: Reject missing or invalid facts

- GIVEN a command omits a required fact, has a value outside the valid Warehouse enum, or has weight not greater than zero
- WHEN it is evaluated
- THEN it is rejected as `INVALID_RECEIPT_FACTS`
- AND no Warehouse bale record is created

### Requirement: Entered Weight Precision

Warehouse MUST preserve accepted received weight at the precision entered by the user and MUST NOT apply business rounding. This requirement SHALL NOT prescribe numeric representation or persistence type.

#### Scenario: Preserve entered precision

- GIVEN a user supplies a positive kilogram weight with fractional precision
- WHEN the operation is accepted
- THEN the resulting bale retains that entered precision
- AND no business rounding is applied

### Requirement: Bale Custody and Identity Invariants

An accepted `RawMaterialBale` MUST begin in Warehouse custody and in `not_delivered` state. `bale_number` uniqueness MUST hold among Warehouse bale records. The capability MUST NOT create or reference a Production identity, lot, delivery transition or time, or aggregate balance.

#### Scenario: Establish initial custody

- GIVEN a valid accepted command
- WHEN the Warehouse bale record is created
- THEN it is Warehouse-held and not delivered
- AND it has no Production or lot identity

#### Scenario: Reject duplicate bale number

- GIVEN a Warehouse bale record has the submitted bale number
- WHEN another command uses that number
- THEN it is rejected as `DUPLICATE_BALE_NUMBER`
- AND the existing record remains unchanged

### Requirement: Authorized Atomic One-Bale Result

The application contract MUST expose a one-bale command and a transport-neutral result containing the `RawMaterialBale` identity and accepted facts. It MUST obtain write authorization through a Warehouse authorization/audit context port before commit. The authenticated registrant is context for authorization and audit, not editable bale data and not a result attribute. Denial MUST return `AUTHORIZATION_DENIED`. The operation MUST commit all required facts or create no record.

#### Scenario: Deny unauthorized receipt

- GIVEN the Warehouse authorization context denies the write action
- WHEN the command is handled
- THEN the result is `AUTHORIZATION_DENIED`
- AND no Warehouse bale record is created

#### Scenario: Prevent partial receipt

- GIVEN validation and authorization succeed but commit cannot complete
- WHEN handling ends
- THEN no Warehouse bale record is created or changed
- AND no partial custody fact is observable

### Requirement: Transport-Neutral Projection

The contract MUST project its command, accepted result, and only `INVALID_RECEIPT_FACTS`, `DUPLICATE_BALE_NUMBER`, and `AUTHORIZATION_DENIED` without prescribing transport, persistence, authentication provider, UI, or provider-specific audit mechanism. The result MUST NOT include a receiving actor, delivery time, Production identity, lot, balance, or listing/query behavior.

#### Scenario: Project a business rejection

- GIVEN a consumer submits a duplicate bale number
- WHEN it receives the result
- THEN it can identify `DUPLICATE_BALE_NUMBER`
- AND it need not interpret adapter-specific details

### Requirement: Deferred Correction and Grouping

Creation MUST NOT overwrite, merge, or silently replay a Warehouse bale record. Controlled correction is separate, policy-governed, auditable, and excluded. This capability defines no receipt aggregate, multi-bale supplier-document orchestration, delivered/undelivered listing, or digitized bale-emission approval. A future grouping workflow MAY introduce its own orchestration identity, but MUST preserve every bale's identity, invariants, custody semantics, and one-bale result.

#### Scenario: Future workflow groups bales

- GIVEN a future workflow groups several supplier bales
- WHEN it uses this capability for each bale
- THEN each accepted operation preserves its own `RawMaterialBale` identity and result
- AND grouping does not alter its custody or invariants

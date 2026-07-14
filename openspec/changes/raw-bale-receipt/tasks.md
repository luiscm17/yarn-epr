# Tasks: Receive Raw-Material Bale

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 280–360 authored lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | One learning-oriented implementation unit |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

No `sdd-apply` is authorized yet; these are a manual implementation guide only.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Complete domain, application, ports, and tests without adapters | One PR | Targeted domain/application/port tests | N/A: no transport/provider exists | Remove this capability and tests without touching future delivery, grouping, approval, or query work |

## Phase 1: Domain Learning — Aggregate, Values, Invariants

- [ ] 1.1 **Objective:** Define `RawMaterialBale` and value concepts for identity, material, entered kilograms, time, custody/state, and evidence. **Prove:** required facts, valid enum, positive unrounded weight, `Warehouse` custody, `not_delivered`; **Depends on:** spec/design; **Evidence:** pure domain tests; **Stop/rollback:** stop if Production, lot, delivery, balance, actor, or rounding enters; revert domain work only.
- [ ] 1.2 **Objective:** Test invalid facts and optional-evidence retention. **Prove:** invalid inputs create nothing and fractional kilograms remain unchanged; **Depends on:** 1.1; **Evidence:** `INVALID_RECEIPT_FACTS` tests; **Stop/rollback:** stop if persistence or authorization is needed.

## Phase 2: Application Learning — Command, Result, Errors, Orchestration

- [ ] 2.1 **Objective:** Define one-bale command/result and only `INVALID_RECEIPT_FACTS`, `DUPLICATE_BALE_NUMBER`, `AUTHORIZATION_DENIED`. **Prove:** result excludes actor, delivery, Production, lot, balances, and listings; **Depends on:** Phase 1; **Evidence:** shape tests; **Stop/rollback:** stop if transport/framework types enter.
- [ ] 2.2 **Objective:** Orchestrate authorization, uniqueness, creation, add, and atomic commit. **Prove:** success, denial/duplicate without mutation, concurrent duplicate mapping, and commit failure without partial receipt; **Depends on:** 2.1; **Evidence:** controllable port/transaction tests; **Stop/rollback:** revert use case/tests if ordering or atomicity fails.

## Phase 3: Outbound Contracts — Authorization, Audit, Repository

- [ ] 3.1 **Objective:** Define authorization/audit and transaction/repository ports. **Prove:** Access Control decides policy, audit context stays opaque, and repository exposes only uniqueness, add, and transaction participation; **Depends on:** Phase 2; **Evidence:** behavior contracts and forbidden-operation checks; **Stop/rollback:** stop if ports mention ORM, schema, provider, CRUD, correction, or actor storage.

## Phase 4: Transport-Neutral Consumer Verification

- [ ] 4.1 **Objective:** Verify consumers interpret accepted results and the three business errors without transport assumptions. **Prove:** success, duplicate, denial, invalid facts, and exclusions; **Depends on:** Phases 1–3; **Evidence:** consumer contract tests; **Stop/rollback:** remove this verification if HTTP/UI/provider details are required.

## Phase 5: Adapter Preparation Notes (No Implementation)

- [ ] 5.1 **Objective:** Record translation obligations for future repository, authorization, HTTP, persistence, and frontend adapters. **Prove:** core contracts, uniqueness, atomicity, precision, and audit context survive translation; **Depends on:** Phase 4; **Evidence:** boundary checklist only; **Stop/rollback:** do not implement routes, providers, persistence, migrations, frontend, retries, idempotency, delivery, grouping, correction, listings, or emission approval.

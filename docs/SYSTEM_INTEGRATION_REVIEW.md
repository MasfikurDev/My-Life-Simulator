# System Integration Review

**Purpose:** Canonical cross-domain audit and staged revision plan for every implemented life system, subsystem, and simulation connection.
**Reviewed:** 2026-11-09
**Scope:** Simulation ownership, state contracts, time progression, cross-domain effects, persistence, accounting, history, and integrated scenario coverage.

This review supplements (and does not replace) the detailed domain specifications. It is an implementation worklist, not a claim that planned systems are already playable.

## Product constraints

- Preserve the Android-first, offline-capable, single-player game and its current text/card/button identity.
- Keep domain-native workspaces. Integration belongs in simulation contracts, not a generic mega-dashboard.
- Keep the weekly cycle, stamina-backed personal activities, automatic education/work responsibilities, and no player-managed timetable.
- Keep monthly settlement planned until it is implemented and tested; do not silently change the current annual cadence.
- Keep strict current-save validation. Do not add compatibility migrations or silently rewrite older saves.
- Do not implement speculative life systems as placeholders. A domain is complete only when its state transitions, persistence, accounting, history, and tests work together.
- Keep TypeScript simulation logic independent of Svelte, browser APIs, Android, and persistence.

## Debug-export version versus local-save schema

The supplied debug snapshot uses `formatVersion: 2`. That is the debug-export envelope version, not the local save schema version. The current local save schema is 6. These versions have separate responsibilities and must not be conflated.

## System and subsystem ownership

| Domain | Owns | Reads from / connects to |
|---|---|---|
| Character | Player identity, attributes, personality, appearance, country/currency, birth date | Calendar, progression, every domain |
| Calendar and progression | Current date, age derivation, life-stage and age eligibility, due boundaries | Character, education, work, family, finance, events |
| Education | Programmes, enrollment, attendance, subjects, tasks, grades, academic results, qualifications | Character, calendar, health/workload, finance for fees, Work for qualification eligibility |
| Work | Job listings, applications, interviews, offers, employment, performance, experience, promotions | Character, education qualifications, health/workload, calendar, Finance for actual payroll |
| Family | People, kinship/guardianship graph, bonds, family history, household membership and dependency relationships | Character, calendar, Finance for support/contributions, Health for future care contracts |
| Health and wellbeing | Stamina, stress, workload, health conditions, treatment, recovery and care actions | Education/work responsibilities, activities, family care when implemented |
| Finance | Cash, accounts, cards, loans, vault, deposits, transactions, tax liabilities, net worth | Work income, family support, Lifestyle costs, property, investments, business, events |
| Lifestyle | Household arrangement/budget, home, purchases, providers and owned subscriptions | Finance payment sources and ledger; calendar for due dates |
| Property and assets | Property ownership, rental state, market values, mortgages, investments, business assets | Finance ledger, economic conditions, taxes and net worth |
| Events and decisions | Eligibility, pending event, choices, costs, effects, decision records and delayed consequences | All domains through explicit effects and domain commands |
| History and reporting | Chronological activity narrative, milestones, domain histories and financial activity views | Domain events and the shared financial ledger; never a second source of truth |
| Persistence | Current-schema envelope, slot isolation, nested validation, debug export | All persisted domain state |
| Presentation | Domain workspaces, weekly review, overview and settings | Read-only projections and validated simulation commands |

## Required integration contracts

1. **One owner per fact.** Character owns player identity and core attributes; Education owns qualifications; Work owns employment; Family owns the relationship graph; Finance owns balances and liabilities; Lifestyle owns household choices and service configuration.
2. **Cross-domain effects use explicit commands or results.** A UI component must not independently mutate a second domain's state. The simulation coordinator composes domain operations and returns one resulting character.
3. **Financial changes are atomic.** Every money movement updates the relevant balance/asset/liability and appends one auditable ledger record. Rejected operations leave the complete input state unchanged.
4. **Ledger and narrative history are distinct.** Life history explains what happened; the financial ledger records exact money movement. A money-related event may create both records, but neither replaces the other.
5. **Transfers preserve value.** Cash/account/card/vault/investment movements must not mint or destroy value except for explicitly recorded fees, interest, taxes, or spending.
6. **No negative cash or hidden debt.** Unaffordable actions fail or follow an explicit modeled shortfall/liability rule. UI disabling is not the validation boundary.
7. **Time is deterministic and idempotent.** Weekly, annual, and future monthly resolution use explicit date boundaries and stable period/action identifiers. Repeated resolution must not duplicate outcomes.
8. **Age and prerequisites are checked twice.** UI availability is a projection; simulation commands enforce eligibility independently.
9. **Automatic responsibilities are not player activities.** Education and employment background progression contribute workload without timetable reservations. Personal activities use the shared stamina plan.
10. **State validation is recursive.** Current-save validation must cover each applicable nested domain, relationship references, unique IDs, money ranges, dates, action payloads, and cross-field invariants before a save is exposed or written.
11. **History is truthful.** Distinct actions should produce distinct, meaningful records. Generic descriptions must not hide whether the player studied, completed an assignment, sat an exam, paid a bill, or received income.
12. **No inferred relationships.** Family membership, co-residence, dependency, support, and household arrangement are separate facts. One must not be inferred from another without an explicit rule and state transition.

## Confirmed issues and work status

### Fixed in the current integration-foundation branch

- **Event costs bypassed the financial ledger.** `resolveGameEvent` deducted choice money directly and only wrote narrative history. A player could spend money on an event without seeing the expense in financial activity or weekly/yearly financial reporting.
- **Delayed event money bypassed the financial ledger.** Money effects from scheduled consequences changed cash without a corresponding income/expense record.
- **Financial transaction IDs could collide after the rolling ledger reached 300 records.** IDs used the current array length; once capped, later transactions in the same year/age reused the same suffix.

The branch adds event cost/reward ledger entries with stable event/consequence identifiers, prevents event money effects from taking cash below zero, and derives transaction sequence numbers from retained IDs. Regression tests cover the event expense, delayed reward, and ledger-cap boundary.

### Confirmed follow-up audit items

- **Current-save validation is shallower than the architecture contract.** `storage.ts` checks the top-level character shape, calendar string patterns, selected attributes, the weekly plan, and some pending-event costs. It does not recursively validate every nested finance, education, family, event, and cross-reference invariant before save/load. The family module has a graph validator, but persistence does not currently use it.
- **Weekly-plan validation is incomplete as a domain boundary.** It checks action kinds and selected payload fields, but the full numeric/range constraints and all action-specific invariants need a centralized audit. A malformed nested payload must not survive until weekly resolution.
- **Simulation orchestration and financial operations are concentrated in `simulation.ts`.** Character generation, weekly resolution, banking, cards, loans, assets, annual settlement, and finance calculations share a large module. Refactor by extracting stable domain ownership incrementally; do not perform a risky all-at-once rewrite.
- **Annual settlement has many interacting subsystems.** Income, household costs, auto-deposits, recurring payments, loans, credit cards, tax, interest, rental income, business results, economic updates and asset valuation need an explicit tested order and exactly-once period guards. The current cadence remains annual. Monthly payroll/bills are not to be implied until implemented.
- **Education and activity history need semantic verification.** A study session, assignment, and exam must remain distinguishable in history and recap. Validate that weekly study targets, task points, enrollment weeks, attendance, grade changes and qualification awards agree.
- **Family and household semantics need validation.** The family graph, household-member IDs, dependency IDs, guardian links, and Character household arrangement must remain separate but consistent. Do not assume a family-supported arrangement means every relative lives in the household, or that co-residence automatically means financial support.
- **Event cadence is intentionally sparse today.** Event preparation is currently year-scoped and the authored starter catalogue is small. Improve contextual triggers, deadlines and follow-through without forcing a random filler event every week.
- **History and reporting projections need a shared audit.** Overview weekly groups, Life History milestones, family history, financial ledger views and weekly recap must agree without duplicating or omitting underlying actions.

## Cross-domain dependency paths to test

- Character birth date → current age/life stage → age-gated education, work, banking, household, and event eligibility.
- Education attendance/tasks/grades → qualifications → Work role eligibility and career options.
- Education + employment workload + selected activities → stamina/stress/health/focus → learning and work outcomes.
- Work offer acceptance/resignation/promotion → employment state → workload and actual Finance payroll; previews must never create ledger income.
- Family interaction/support → relationship bonds and family history; financial support must also atomically debit/credit the correct accounts and write Finance ledger records.
- Household arrangement and owned services → recurring costs/payment source → Finance ledger, cash/account/card balance, missed-payment state and wellbeing consequences only where explicitly modeled.
- Property/investment/business changes → asset/liability values → net worth and tax calculations → ledger entries.
- Event choice → validated stamina/money costs → owning-domain effects → ledger/history/decision record → scheduled consequence → exactly-once future result.
- Calendar progression → birthdays, age eligibility, education/work weekly responsibilities, event expiry, annual settlement, and future date-based monthly obligations.
- Save/load/debug export → all current domain state, stable references and history without mutation, silent defaults, duplicated records or cross-slot leakage.

## Revision sequence

Each stage is a focused pull request with domain tests and integrated regression coverage. Do not merge a broad rewrite without evidence.

1. **Financial event integrity — started in this branch.** Record event costs and delayed financial rewards; guarantee transaction ID uniqueness at the ledger cap.
2. **Persistence and domain validation.** Add complete nested validators for Character, calendar, weekly actions, family graph, education, employment, events and financial products. Validate cross-references and prove rejected saves remain untouched.
3. **Simulation transaction boundaries.** Audit all mutating commands for atomic failure behavior, unique action IDs, duplicate execution, and explicit domain ownership.
4. **Weekly coordinator and wellbeing.** Verify the exact order of automatic education/work responsibilities, selected activities, care actions, workload, grades, health, stamina and recap. Ensure preview and actual resolution share one resolver.
5. **Education ↔ Work.** Verify prerequisite chains, completed qualifications, fields/categories, role eligibility, application/interview timing, offers, resignation, promotions and actual payroll.
6. **Family ↔ Household ↔ Finance ↔ Health.** Validate kinship, guardianship, co-residence, dependency, support, household budgets and future care contracts without assuming any of them from another.
7. **Finance ↔ Lifestyle ↔ Assets ↔ Economy ↔ Tax.** Audit every operation against a balance-sheet invariant, recurring payment source, failed-payment behavior, interest, asset valuation, tax and net-worth calculation. Keep the annual cadence until a separately tested monthly cadence is approved and implemented.
8. **Events ↔ every domain.** Add contextual triggers, due dates, expiry, follow-up chains and domain-owned effects; preserve sparse quiet weeks and deterministic outcomes.
9. **Life-stage coverage.** Review childhood through later life for eligibility, meaningful choices, system availability, education/work transitions, household changes and missing terminal-life mechanics. Do not claim retirement, mortality, inheritance or legacy until complete.
10. **Integrated scenario suite.** Add deterministic multi-week and multi-year scenarios for child/student, teen student-worker, university student, employed adult, job seeker, family-supported adult, independent household, caregiver when implemented, business/property owner, and later-life character. Assert state, money, ledger, history, dates, and persistence after each transition.

## Completion criteria

A system is not complete because a workspace or control exists. It must have:

- one clear owner and typed domain contract;
- validated actions and state transitions;
- atomic failure behavior;
- deterministic and idempotent time progression;
- explicit cross-domain effects;
- correct financial accounting where money changes;
- truthful narrative and domain history;
- current-schema save/load validation;
- focused unit tests and multi-domain scenario tests;
- UI that exposes only implemented behavior and presents it in its owning workspace.

The overall revision is complete only when the integration paths and scenario suite pass together.
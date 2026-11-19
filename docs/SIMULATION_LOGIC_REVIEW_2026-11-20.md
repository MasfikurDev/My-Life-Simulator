# Simulation Logic Review — 2026-11-20

**Review date:** 2026-11-20  
**Repository:** `MasfikurDev/My-Life-Simulator`  
**Branch reviewed:** `main`  
**Reviewed commit:** `ba511a3ec41c952cdf655532cfe7d5f359ab45d4`  
**Method:** Graphify repository graph review followed by source-level inspection of the indexed implementation and relevant tests.  
**Change scope:** Documentation only. No gameplay code or save data was changed.

This review supplements [Comprehensive Project Audit](COMPREHENSIVE_PROJECT_AUDIT.md). It records logic-level findings that deserve explicit tracking. It is not a runtime test report, and it does not claim that CI or the full test suite passed.

## Executive summary

The project has a useful simulation foundation: a central weekly resolver, domain modules, deterministic planning, annual settlement, and tests across several domains. The main concern is not a need to replace that architecture. It is that some cross-domain contracts are inconsistent or incomplete, especially around annual time, property costs, financial classification, and family lifecycle.

Prioritize correctness defects before expanding the simulation. Keep larger product gaps—family formation, later-life progression, mortality, and estate/legacy—as separately designed gameplay milestones.

## Findings

### SIM-01 — Direct annual advancement can leave the calendar date behind

**Priority:** High  
**Area:** Time progression  
**Location:** `web/src/lib/simulation.ts`

The direct `advanceYear()` path calls `settleCalendarYear()`, which updates the character's age and year but does not advance `calendar.currentDate`. Weekly progression derives age/year from the calendar date. A subsequent `advanceWeek()` can therefore derive the older date's year/age and overwrite the values set by direct annual advancement.

**Scope caveat:** This concerns the direct annual/helper path. The normal player-facing weekly path is not established as affected by this finding.

**Required correction:** Make the direct annual path and canonical calendar date agree. Add a regression test that advances a year directly and then advances a week, asserting monotonic date, year, and age. Preserve the intended coarse annual behavior: do not replay 52 player-selected weekly plans or duplicate annual settlement.

### SIM-02 — Property maintenance is included in annual household settlement

**Priority:** Resolved by existing behavior; regression coverage added  
**Area:** Property and household finance  
**Locations:** `web/src/lib/simulation.ts`, `web/src/lib/types.ts`

Property purchase stores `annualMaintenance` (currently 1% of value). The initial review missed that `getHouseholdBudget()` already adds maintenance for every owned property to annual housing costs, and `settleCalendarYear()` pays that budget through the existing household-expense ledger entry. Charging it again during asset settlement would double-charge the player.

**Correction:** Preserve the single annual household-budget charge and add a regression test proving maintenance is included once in the settled annual expense. The current ledger keeps it grouped with household expenses rather than creating a separate maintenance transaction.

### SIM-03 — Rental income is classified as an expense in financial flow summaries

**Priority:** High  
**Area:** Financial reporting  
**Location:** `web/src/lib/simulation.ts`

Rental settlement records a `property-rent` transaction that moves money from the property to cash. The financial-flow classification currently groups `property-rent` with expenses. This can make reporting show rental income as an outflow.

**Required correction:** Give rental receipts an income classification distinct from rent paid by the player. Add tests for transaction direction, income/expense totals, and resulting cash balance.

### SIM-04 — Business tax estimation does not use the same profit calculation as settlement

**Priority:** High  
**Area:** Business and taxation  
**Location:** `web/src/lib/simulation.ts`

Annual business settlement calculates operating results using business-type profile inputs, performance, economy growth, and market shock. The annual tax estimate uses a separate approximation based on invested capital, performance, and economy growth, omitting parts of the settlement calculation. The estimate can therefore diverge from the profit actually booked.

**Required correction:** Establish one authoritative business-result calculation and reuse it for settlement, tax estimation, and reporting. Test profitable, loss-making, and market-shock scenarios. Keep tax rules themselves explicit rather than hiding them inside the operating-profit calculation.

### SIM-05 — Family weekly planning rules disagree between UI and simulation

**Priority:** Medium  
**Areas:** Family workspace and weekly plan validation  
**Locations:** `web/src/lib/family.ts`, `web/src/components/FamilyWorkspace.svelte` (verify current path if the component is moved)

The simulation-side planning rule limits a family member to one interaction per week. The Family workspace availability check appears to distinguish both the member and interaction type, so it can offer a second interaction with the same person that the simulation later rejects.

**Required correction:** Make the UI availability projection match the authoritative simulation rule, or deliberately revise the rule in both places. Add a test for the exact UI/engine contract so the player is not offered an action that cannot be planned.

### SIM-06 — Annual family progression does not yet simulate family lifecycle

**Priority:** Medium — gameplay completeness  
**Area:** Family  
**Location:** `web/src/lib/family.ts`

The annual family advancement currently records the simulated year but does not itself advance relationship development or produce family lifecycle transitions. Person ages can be derived from birth dates, but that is not equivalent to simulating family events or relationship evolution.

**Required direction:** Treat this as a gameplay-system gap, not a request to add arbitrary passive relationship decay. Define meaningful, state-grounded transitions—such as partnership, separation, parenthood/adoption, dependants, caregiving, and family loss—only with explicit eligibility, consent/choice, household, finance, health, history, and persistence rules.

### SIM-07 — Full family formation and birth-to-death lifecycle remain incomplete

**Priority:** Medium — major product gap  
**Areas:** Family, progression, life history

The indexed implementation provides a family-of-origin foundation and relationship types for some future connections, but this review did not find a complete player-facing lifecycle for forming partnerships, having/adopting children, supporting dependants, or continuing a family across generations. Nor did it find a complete player mortality, terminal-life, estate settlement, inheritance, or succession flow.

**Required direction:** Design these as connected lifecycle milestones, not isolated screens or one-off APIs. Do not infer partners, children, co-residence, support, or inheritance. A complete birth-to-death claim requires an integrated playthrough and terminal-state/legacy rules.

### SIM-08 — Recurring payments use annual settlement rather than a monthly due-date model

**Priority:** Medium — known cadence limitation  
**Areas:** Finance, subscriptions, household expenses  
**Locations:** `web/src/lib/types.ts`, `web/src/lib/simulation.ts`

Recurring-payment records are year-based and are settled through annual financial processing. This does not yet provide the monthly billing rhythm expected for subscriptions and ordinary recurring obligations.

**Required direction:** Monthly settlement is already the intended financial cadence in the product direction. Implement it as a dedicated design and migration milestone covering due dates, proration/start dates, missed payments, insufficient funds, cancellation, and month/year boundaries. Do not bolt monthly charges onto the existing annual settlement without period guards and reconciliation tests.

### SIM-09 — Household settlement does not draw from bank balances

**Priority:** Medium — contract decision required  
**Area:** Banking and household finance  
**Location:** `web/src/lib/simulation.ts`

The annual household affordability calculation uses cash and employment income; it does not appear to include available balances in bank accounts. This can report a shortfall while the character has savings in an account.

**Required decision:** Clarify whether household costs are cash-only or should use configured payment sources/autopay. The product direction includes banking, cards, autopay, and deposits, so the intended funding hierarchy needs to be explicit. Do not automatically liquidate savings or overdraw accounts without player authorization and clear rules.

## Existing foundations to preserve

- Keep `simulation.ts` as the orchestration boundary while extracting stable domain operations incrementally; do not rewrite the simulation engine.
- Keep weekly resolution deterministic and protect failed/stale plans from partial state mutation.
- Keep family, education, work, wellbeing, lifestyle, events, markets, and storage logic in their owning domain modules.
- Keep financial changes auditable through the shared transaction history/ledger.
- Keep the weekly player turn, intended monthly financial rhythm, and yearly life-stage progression distinct.
- Keep unsupported save-schema changes explicit and non-destructive. This review does not recommend silent backward migration.

## Recommended implementation order

1. **Correctness PR:** SIM-01, SIM-03, SIM-04, and SIM-05, with regression coverage confirming the existing SIM-02 maintenance charge is applied once. Keep this focused on calendar consistency, rental classification, business profit/tax consistency, and family planner agreement.
2. **Finance contract PR:** Resolve SIM-09 payment-source behavior and add balance/ledger invariants before changing household settlement.
3. **Monthly finance milestone:** Implement SIM-08 only after due-date and shortfall semantics are specified.
4. **Family lifecycle milestone:** Address SIM-06 and SIM-07 through a cohesive family/life-stage design, then implement in small vertical slices.
5. **Integrated regression coverage:** Add multi-week and multi-year scenarios spanning household, family, career, property, business, and finance. Keep long stress tests separate from the fast PR path when appropriate.

## Implementation follow-up

The focused correctness implementation adds calendar alignment for direct annual advancement, clears stale weekly plans when that coarse annual turn is used, centralizes financial-flow classification, shares one business operating-result calculation between settlement and tax estimation, and makes Family workspace actions follow the same one-interaction-per-person rule enforced by the planner. SIM-02 is retained as a regression guard rather than adding a second charge.

## Validation results — PR #225

All required GitHub Actions checks passed for head commit `9f19382ae26578df6c27c933201530d4226fc330`:

- [Web validation and Pages deployment](https://github.com/MasfikurDev/My-Life-Simulator/actions/runs/44638209328): 15 test files passed, 205 tests passed, Svelte check reported 0 errors and 11 warnings, and the production Vite build completed successfully. The Pages deployment step was correctly skipped for a pull request.
- [Long simulation audit](https://github.com/MasfikurDev/My-Life-Simulator/actions/runs/44638209320): passed.
- [Pull request safeguards](https://github.com/MasfikurDev/My-Life-Simulator/actions/runs/44638209316): passed.

The connected local development devices were offline, so validation was performed in GitHub Actions rather than locally. The Family workspace interaction-control change still needs visual review before this Draft PR is marked ready for review.

## Status

SIM-01, SIM-03, SIM-04, and SIM-05 are implemented on Draft PR #225. SIM-02 was confirmed to be covered by the existing annual household-budget settlement and is protected by a regression test; no duplicate charge was added. These changes have passed the listed automated checks but have not been merged.

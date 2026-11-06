# Roadmap

**Working sequence, not date promises · Reviewed 2026-11-06**

## Milestone 0 — GitHub-first foundation
- [x] Preserve product, gameplay, visual, architecture, and AI collaboration decisions.
- [ ] Build web client and independent simulation boundary.
- [ ] Build minimal Android WebView wrapper.
- [ ] Add focused Actions validation and Pages deployment.
- [ ] Produce installable APK artifact.
- [ ] Verify web updates reach the installed app after fresh launch.

## Milestone 1 — First enjoyable life loop
Scenario-led character creation with coherent randomized identities; three independent local save slots; readable dashboard; meaningful age-appropriate activities with costs/consequences; deliberate year progression; contextual events and life-history entries; reliable save recovery/migration tests; optional sound feedback.

Selectable starting ages are an entry point, not a claim that full childhood, education, retirement, or generational systems are complete.

## Milestone 2 — Age-specific progression and connected systems
- [x] Establish life-stage bands and enforce initial activity eligibility in both UI and simulation.
- [x] Add age-stage education, study progress, and higher-education qualification.
- [x] Add teen part-time applications, adult full-time employment, later-life flexible-work offers, and adult job changes.
- [x] Add annual salary, estimated living costs, career performance, and promotion progression.
- [x] Enforce affordability for paid activities in both the UI and simulation, with currency-scaled costs and no free effects when funds are insufficient.
- [x] Add a settings game log and portable debug snapshot for reproducible testing.
- [ ] Expand age/prerequisite eligibility to contextual events, household responsibilities, and relationships.
- [x] Add age-18+ household budgets with family-supported/shared/independent living, recurring expense categories, unemployment shortfall pressure, and emergency savings targets.
- [x] Add a unified money ledger and age-gated checking, savings, and fixed-deposit accounts with deposits, withdrawals, transfers, interest, and a net-worth summary.
- [x] Add configurable automatic deposits, debit/credit/prepaid cards, recurring bills and subscriptions, and a personal safe/vault.
- [x] Add personal, mortgage, and business loan products with annual interest, scheduled installments, and extra repayments.
- [x] Add housing/property ownership, mortgages, rental choices, rental income, maintenance and sale.
- [x] Add stock-index and gold trading with simulated price movement, plus small-business ownership and management.
- [x] Add bounded economic cycles, inflation, growth and benchmark-rate indicators; link inflation to living costs, subscriptions, rental agreements, and market valuations.
- [x] Add simplified progressive income tax, rental/business income tax, annual property levy, and carried unpaid tax liability.
- [x] Add a simplified 300–850 credit score using payment history, utilization, debt and unpaid taxes; price personal, mortgage and business loans from the score.
- [x] Add simplified brokerage/transfer fees and capital-gains tax on investment/property sales.
- [ ] Add full affordability checks and variable-rate debt.
- [ ] Add benefits and taxes after household budgets and financial flows are balanced.

- [x] Organize Finance around Banking, Taxes, Property, Investments, and Business; group accounts, cards, loans, savings, and vault inside Banking.
- [x] Add Life → Lifestyle with a provider marketplace, supermarket checkout, owned subscriptions/services, payment-method references, and household costs.
- [x] Separate School and Work into age-gated, domain-native destinations using existing simulation actions and save fields.
- [x] Consolidate personal wellbeing, personal growth, personal activities, and complete life history under a modular Life workspace.
- [ ] Expand School with enrollment, attendance, classes, grades, and education history only when each mechanic has a complete simulation loop.
- [ ] Expand Work with a real application/interview/offer flow and richer workplace interactions; do not display placeholder recruitment stages.

## Milestone 3 — Replace annual actions with the weekly gameplay cycle (next priority)

**Design decision:** weekly is the playable time unit; monthly is the financial/reporting unit; yearly is the life-progression unit. This milestone is a foundational redesign, not a cosmetic change from "3 actions/year" to "3 actions/week".

- [x] Specify and test pure date helpers: Monday–Sunday week boundaries, month/year rollover, leap years, birthdays, and age calculation.
- [x] Define a compact schedule model for actual recurring commitments and discretionary free-time blocks; do not simulate every hour or reserve time for unimplemented school/work schedules. The first model uses three broad periods per day and validates overlaps; no school/work commitments are invented.
- [x] Add a visible Life → Schedule planner with a seven-day, 21-period grid, age-available activity planning, duration-based reservations, conflict prevention, and removal. Planned activities are saved; they are not yet resolved or marked complete.
- [x] Centralize per-activity time requirements and validate planned activities in the simulation: life-stage eligibility, current-week boundaries, duration fit, overlaps, and aggregate planned cash costs.
- [x] Complete the cutover from annual action tokens across personal activities, family interactions, event choices, and business management.
- [x] Resolve planned activities deterministically, apply gameplay effects, and charge accepted costs exactly once.
- [x] Add deterministic, exactly-once weekly resolution with history, recap, and seven-day calendar advancement.
- [ ] Adapt contextual events, deadlines, and delayed consequences to date/week boundaries.
- [ ] Move recurring payments and payroll to explicit monthly/weekly due dates only where supported; retain annual taxes, market updates, and annual reviews at defined annual boundaries.
- [ ] Prevent duplicate or skipped financial settlement across month/year boundaries; document rounding and payment-failure behavior.
- [ ] Add safe migration for existing annual-action saves across all three slots; preserve balances, ledger, liabilities, assets, employment/education, history, pending events, and completed choices.
- [ ] Add multi-week advancement only after single-week resolution is reliable; it must stop before important decisions, deadlines, events, birthdays, and payment failures.
- [ ] Replace the year-only review with a concise weekly review, monthly Finance statement, and annual life review without duplicating domain workspaces.

**Acceptance:** A fresh and migrated save can play several weeks with different activity durations, meaningful time conflicts, contextual events, and persistent consequences. Month-end and year-end processing occur exactly once. Birthday/age eligibility changes on the correct date. Quiet weeks can be advanced quickly. Scenario tests cover a school-age child, employed adult, unemployed adult, and later-life character. Existing saves and all financial invariants remain intact.

## Milestone 4 — Personal Technology (after weekly time foundation)

**Goal:** add smartphones, laptops, and desktop PCs as useful optional assets connected to everyday life.

- [ ] Add Life → Personal Technology and a separate Lifestyle Discover technology retailer.
- [ ] Add a small fictional catalogue with category-aware capability tiers and new/used options.
- [ ] Implement individual device ownership/access records and save/load compatibility.
- [ ] Route purchases, repairs, and resale through the existing Finance transaction/ledger path.
- [ ] Add basic condition, repair, replacement, and age/guardian rules.
- [ ] Integrate a few real capability/access checks into School, Work, and Personal activities.
- [ ] Provide shared/school/work/public/non-digital alternatives so ownership is not a core progression paywall.
- [ ] Test children, teens, adults, low-income saves, failed purchases, repair, and shared access.

**Acceptance:** Device ownership and costs persist accurately; failed transactions are atomic; capabilities enable specific contextual opportunities; other domains do not duplicate device management; existing saves remain valid. Detailed rules: [PERSONAL_TECHNOLOGY.md](PERSONAL_TECHNOLOGY.md).

## Milestone 5 — Deepen School and Work into playable systems
- [ ] Add real school progression choices, enrollment, attendance, classes, grades/exams, and fees in the School workspace.
- [ ] Add recruitment stages with applications, interviews, offers, acceptance/decline, employer identity, and workplace decisions in Work.
- [ ] Clarify the current-job card and add a read-only career-path preview with estimated salary/bonus ranges; see [CAREER_PROGRESSION.md](CAREER_PROGRESSION.md).
- [ ] Connect qualifications, role-specific skills, performance, experience, vacancies, and promotion decisions without using a universal fixed-week grind or guaranteeing outcomes.
- [ ] Add conditional bonuses/benefits, career stability, job changes, layoffs, and deeper progression only with complete payroll and workplace loops.

**Acceptance:** Education and career choices change future options and have visible consequences; no placeholder status is shown as a real mechanic.

## Milestone 6 — Persistent family and relationships

**Specification:** [FAMILY_SYSTEM.md](FAMILY_SYSTEM.md). Family is simulation-first: persistent people, validated kinship/guardianship graph, separate closeness/trust/tension, household/dependency state, and auditable family history.

- [x] Add optional, backward-compatible family graph types and stable player/relative identities.
- [x] Generate a modest family-of-origin context for new characters without assuming a partner or children.
- [x] Add graph validation for identity, relationship endpoints, duplicate links, parent/guardian cycles, bonds, and history.
- [x] Add targeted spend-time, reach-out, and conflict-reconciliation interactions with simulation-side age/action validation.
- [x] Add adult financial support as a cash outflow in the shared Finance ledger.
- [x] Add an explicit family-background initialization path for existing saves that lack family data.
- [ ] Expand the relationship graph with explicit partnership, separation, parenthood, adoption, and guardianship lifecycle operations.
- [ ] Add contextual family events, cooldowns, delayed consequences, and relationship-specific follow-ups.
- [ ] Model dependants, childcare, shared household membership, and caregiving with complete Time/Finance/Health contracts.
- [ ] Integrate family mortality and bereavement with the global mortality/terminal-state model.
- [ ] Add estate, inheritance, and generational continuation only after people, assets, dependants, and terminal-life state are reliable.
- [x] Migrate family interactions from annual actions to weekly time blocks.

**Acceptance:** Family is represented by real people and validated relationships, not a single score. Interactions materially affect the selected relationship and are recorded. Financial support cannot create money or hidden debt. New and legacy saves remain valid. Different family structures and child/adult/later-life scenarios are tested. No unimplemented partner, child, care, death, or inheritance state is shown as fact.

## Milestone 7 — Health, aging, retirement, and later-life economy
- [ ] Make health, happiness, and fitness affect gameplay through transparent, bounded rules.
- [ ] Add illness/injury/recovery and healthcare costs only as complete playable loops.
- [ ] Add retirement choices, sustainable pension/retirement income, and age-appropriate later-life expenses.
- [ ] Support continuing work, flexible work, or retirement without arbitrary forced retirement.

**Acceptance:** A later-life character can survive financially through plausible modeled income/expenses, and health changes create understandable gameplay consequences.

## Milestone 8 — Death, final life summary, and legacy
- [ ] Add explainable mortality risk and a critical-health resolution path.
- [ ] Make death a terminal state that stops aging and living-character actions.
- [ ] Present a final life summary based only on recorded facts.
- [ ] Add estate, inheritance, dependants, or generational continuation only after the underlying ownership and family models are implemented.

**Acceptance:** A complete playthrough can end naturally, preserve its completed save, explain the life outcome, and never continue aging after death.

## Milestone 9 — Replayability and balance
- [ ] Add more event variety, authored milestone arcs, trait interactions, and optional achievements/challenges.
- [ ] Balance multiple viable life strategies and test different starting ages, country profiles, and economic circumstances.
- [ ] Run repeatable birth-to-death playthroughs and edge-case simulations before claiming the game is complete.

## Later, only when justified
Generational play beyond the first complete legacy loop, cloud backup, online/social features, WASM acceleration after profiling, and monetization after the core game is enjoyable.

## Scope control
Every milestone needs a playable outcome and acceptance criteria. Avoid parallel implementation of multiple future systems. Prioritize coherence and fun over feature count.

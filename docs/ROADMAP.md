# Roadmap

**Working sequence, not date promises · Reviewed 2026-11-05**

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

## Milestone 3 — Rebuild the annual gameplay loop and event engine (next priority)
- [ ] Replace simple annual stat progression with a clear year-opening, decision, event, year-review, explicit-advance, and year-recap flow.
- [ ] Keep the current annual action budget initially, but make action costs and opportunity costs visible and meaningful.
- [x] Add an initial curated set of contextual events with distinct choices, action/money costs, immediate effects, delayed consequences, and history entries.
- [x] Add age/health eligibility, deterministic selection, per-life uniqueness, choice validation, and persistent scheduled follow-ups for the first event set.
- [x] Persist event choices and delayed effects in the character save; resolve the first follow-up into next-year state and history.
- [x] Add a compact year recap on Home using recorded simulation history.
- [ ] Expand event selection with richer context, cooldowns, category balancing, and a larger authored event set.
- [ ] Add a complete year-opening/planning/review phase and a clear preview of predictable year-end effects.
- [ ] Ensure unused actions cannot be exploited to receive free benefits; time still advances only on explicit player confirmation.

**Acceptance:** A fresh character can play several consecutive years with varied, age-appropriate decisions. At least one choice has a tested delayed consequence. The player can explain why a major outcome occurred from visible game history. The same seed and save produce reproducible simulation results.

## Milestone 4 — Deepen School and Work into playable systems
- [ ] Add real school progression choices, enrollment, attendance, classes, grades/exams, and fees in the School workspace.
- [ ] Add recruitment stages with applications, interviews, offers, acceptance/decline, employer identity, and workplace decisions in Work.
- [ ] Connect qualifications and work performance to opportunities without making outcomes deterministic.
- [ ] Add career stability, job changes, layoffs, and progression only with complete action/outcome loops.

**Acceptance:** Education and career choices change future options and have visible consequences; no placeholder status is shown as a real mechanic.

## Milestone 5 — Persistent family and relationships
- [ ] Model persistent people and family roles with relationship state, history, and age-appropriate interactions.
- [ ] Add relationship events and meaningful follow-ups, including support, conflict, milestones, and responsibilities.
- [ ] Connect dependants and family support to household finances only through explicit, auditable rules.

**Acceptance:** Relationships are represented by actual people and interactions, not a single isolated score; family support and obligations have tested effects.

## Milestone 6 — Health, aging, retirement, and later-life economy
- [ ] Make health, happiness, and fitness affect gameplay through transparent, bounded rules.
- [ ] Add illness/injury/recovery and healthcare costs only as complete playable loops.
- [ ] Add retirement choices, sustainable pension/retirement income, and age-appropriate later-life expenses.
- [ ] Support continuing work, flexible work, or retirement without arbitrary forced retirement.

**Acceptance:** A later-life character can survive financially through plausible modeled income/expenses, and health changes create understandable gameplay consequences.

## Milestone 7 — Death, final life summary, and legacy
- [ ] Add explainable mortality risk and a critical-health resolution path.
- [ ] Make death a terminal state that stops aging and living-character actions.
- [ ] Present a final life summary based only on recorded facts.
- [ ] Add estate, inheritance, dependants, or generational continuation only after the underlying ownership and family models are implemented.

**Acceptance:** A complete playthrough can end naturally, preserve its completed save, explain the life outcome, and never continue aging after death.

## Milestone 8 — Replayability and balance
- [ ] Add more event variety, authored milestone arcs, trait interactions, and optional achievements/challenges.
- [ ] Balance multiple viable life strategies and test different starting ages, country profiles, and economic circumstances.
- [ ] Run repeatable birth-to-death playthroughs and edge-case simulations before claiming the game is complete.

## Later, only when justified
Generational play beyond the first complete legacy loop, cloud backup, online/social features, WASM acceleration after profiling, and monetization after the core game is enjoyable.

## Scope control
Every milestone needs a playable outcome and acceptance criteria. Avoid parallel implementation of multiple future systems. Prioritize coherence and fun over feature count.

# Roadmap

**Working sequence, not date promises · Reviewed 2026-11-08**

## Milestone 0 — GitHub-first foundation
- [x] Preserve product, gameplay, visual, architecture, and AI collaboration decisions.
- [x] Build web client and independent simulation boundary.
- [x] Build minimal Android WebView wrapper.
- [x] Add focused Actions validation and Pages deployment.
- [x] Produce installable APK artifact.
- [x] Verify web updates reach the installed app after fresh launch.

## Milestone 1 — First enjoyable life loop
Scenario-led character creation with coherent randomized identities; three independent local save slots; readable domain-native workspaces; meaningful age-appropriate activities with costs/consequences; explicit weekly progression; contextual events and life-history entries; three local save slots; reliable save recovery/migration tests; optional sound feedback.

Selectable starting ages are an entry point, not a claim that full childhood, education, retirement, or generational systems are complete.

## Milestone 2 — Age-specific progression and connected systems
- [x] Establish life-stage bands and enforce initial activity eligibility in both UI and simulation.
- [x] Add the initial age-derived education labels and study-progress foundation.
- [x] Add optional structured education-history and qualification records to the character model, plus generated stamina, focus, confidence, discipline, creativity, social skills and stress attributes.
- [x] Add a playable education catalogue from early learning and primary/secondary school through vocational, college, bachelor's, master's, doctoral and professional certificate/specialist routes.
- [x] Build the Education workspace with enrollment, automatically arranged class commitments, subjects, grades, weekly study/assignment/assessment tasks, tuition, pause/resume and academic history.
- [x] Add professional certificate courses and programme-linked qualifications; connect completed degrees and programme IDs to career eligibility.
- [ ] Expand localized course catalogs, regulated licensing, qualification expiry/renewal, scholarships, retakes and apprenticeship placements.
- [x] Add role/course-specific ability prerequisites and weekly stress/stamina effects on learning and work efficiency.
- [ ] Expand long-term attribute growth, diminishing returns and broader health-condition variety.
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
- [x] Expand Education with enrollment, attendance commitments, classes, grades, weekly tasks, programme completion and education history.
- [x] Implement a weekly job board, visible role requirements, scheduled applications and interviews, expiring offers, acceptance/decline, career-path previews, player-controlled promotion offers, and voluntary resignation.
- [x] Add initial role-specific eligibility gates for focus, social skills, confidence, discipline and creativity alongside age, education, intelligence and experience.
- [ ] Expand work into a complete age-appropriate path spanning part-time work, internships, apprenticeships, skilled occupations, professional careers, management and flexible later-life work; connect it to real education and credential records.
- [ ] Add richer workplace interactions, employer structures, layoffs/job security, and persistent vacancies; do not display placeholder stages.

## Milestone 3 — Replace annual actions with the weekly gameplay cycle (core transition complete)

**Design decision:** weekly is the live playable time unit; monthly is the intended financial/reporting unit; yearly is the life-progression and current annual-settlement unit. The annual-action cutover, automatic contextual placement, and deterministic weekly resolution are implemented. Remaining work is listed separately below.

- [x] Specify and test pure date helpers: Monday–Sunday week boundaries, month/year rollover, leap years, birthdays, and age calculation.
- [x] Define a compact schedule model for actual recurring commitments and discretionary free-time blocks; do not simulate every hour. The first model uses three broad periods per day and validates overlaps. Employment adds type-based recurring Work shifts; Education enrollment adds recurring class commitments to the same validated schedule.
- [x] Add a Schedule review workspace with a seven-day, 21-period grid, recurring commitments, automatic reservations, duration visibility, planned-cost summary, and reservation removal. Routine actions are initiated only from their owning domain.
- [x] Centralize per-activity time requirements and validate planned activities in the simulation: life-stage eligibility, current-week boundaries, duration fit, overlaps, and aggregate planned cash costs.
- [x] Complete the cutover from annual action tokens across personal activities, family interactions, event choices, business management, and contextual Work actions.
- [x] Make routine scheduling contextual and automatic across School, Work, Family, Business, Events, and Life; return the chosen date/period to the originating screen and keep the player out of generic date/time forms.
- [x] Keep Schedule as a review/cancellation surface rather than a generic action launcher.
- [x] Resolve planned activities deterministically, apply gameplay effects, and charge accepted costs exactly once; reject and preserve a turn if a reservation becomes stale before resolution.
- [x] Add deterministic, exactly-once weekly resolution with history, recap, and seven-day calendar advancement.
- [ ] Adapt remaining contextual events, deadlines, and delayed consequences to date/week boundaries.
- [ ] Move recurring payments, employment payroll, and business operating cash flow to explicit monthly/weekly due dates only where supported; retain annual taxes, market updates, and annual reviews at defined annual boundaries. Until then, salary and household settlement remain annual and are a known pacing limitation of the weekly loop.
- [ ] Prevent duplicate or skipped financial settlement across month/year boundaries; document rounding and payment-failure behavior.
- [x] Migrate schema 1 single-save and schema 2 multi-slot saves to the weekly model; preserve valid character records and all three slots, anchor missing calendars without changing displayed age, and retain the original payload as a recovery copy.
- [ ] Add multi-week advancement only after single-week resolution is reliable; it must stop before important decisions, deadlines, events, birthdays, and payment failures.
- [ ] Complete the concise weekly review, add a monthly Finance statement when monthly settlement is implemented, and keep the annual life review separate from weekly recap.

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
- [x] Add education progression choices, enrollment, class commitments, weekly assignments/exams, grades, tuition and academic history in the Education workspace.
- [x] Add recruitment stages with applications, interviews, offers, acceptance/decline, generated employer identity, and job-change/resignation flow in Work.
- [ ] Add persistent employer operations, workplace decisions, layoffs/job security, and role-specific skill development.
- [ ] Clarify the current-job card and add a read-only career-path preview with estimated salary/bonus ranges; see [CAREER_PROGRESSION.md](CAREER_PROGRESSION.md).
- [x] Connect general education, knowledge, career experience, performance, and role requirements to transparent readiness checks and player-controlled promotion offers without a universal fixed-week grind.
- [ ] Add role-specific skills, persistent vacancies, employer decisions, and promotion outcomes tied to workplace conditions.
- [x] Add job changes and voluntary resignation through the shared employment record. Job type now controls recurring Work commitments, and changing/leaving jobs replaces or removes those commitments safely.
- [ ] Add conditional bonuses/benefits, monthly payroll, career stability, layoffs, and deeper workplace progression only with complete finance and employer loops.

**Acceptance:** Education and career choices change future options and have visible consequences; no placeholder status is shown as a real mechanic.

## Milestone 6 — Persistent family and relationships (foundation implemented)

**Specification:** [FAMILY_SYSTEM.md](FAMILY_SYSTEM.md). The simulation-first foundation and targeted weekly interaction loop are implemented; lifecycle expansion remains staged. Family is: persistent people, validated kinship/guardianship graph, separate closeness/trust/tension, household/dependency state, and auditable family history.

- [x] Add optional, backward-compatible family graph types and stable player/relative identities.
- [x] Generate a modest family-of-origin context for new characters without assuming a partner or children.
- [x] Add graph validation for identity, relationship endpoints, duplicate links, parent/guardian cycles, bonds, and history.
- [x] Add targeted spend-time, reach-out, and conflict-reconciliation interactions with simulation-side age/time validation.
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
- [x] Add bounded workload/stress/stamina effects and recovery actions; keep health/happiness/fitness connected to weekly outcomes.
- [x] Add a basic medical-care loop with condition monitoring, scheduled check-ups, counselling, rest, mindfulness and short treatment courses.
- [ ] Expand into illness/injury variety, chronic care, healthcare access, insurance and localized medical costs.
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


## UI foundation (in progress)

- Establish semantic design tokens and reusable Svelte primitives before expanding the component catalogue.
- Keep AMOLED as the default and add explicit, locally persisted player themes through Settings → Appearance.
- Migrate repeated controls and surfaces incrementally; preserve each domain's own visual language and avoid a generic dashboard/card system.
- Expand the shared component set only when multiple screens have a real repeated pattern. Verify contrast, focus, touch targets and responsive behavior across every theme.

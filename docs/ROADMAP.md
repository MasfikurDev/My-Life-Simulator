# Roadmap

**Working sequence, not date promises · Reviewed 2026-11-09**

## Project status snapshot · 2026-11-09

This is a repository-backed progress snapshot, not a claim that every visible workspace is a complete simulation system. The detailed system specifications below remain authoritative for behavior and acceptance criteria.

- **Weekly simulation:** the annual-action-to-weekly-turn transition is implemented. Date/week calendar, automatic School/Work responsibilities, stamina-based personal activities, deterministic weekly resolution, history, recap, and schema 6 current weekly-plan save baseline are in place.
- **Education:** playable foundation from school through higher education/professional programmes, with enrollment, automatic attendance/progression, weekly study/assessment tasks, grades, tuition, and qualification records. Localization, licensing, scholarships, retakes, and apprenticeships remain incomplete.
- **Work:** recruitment, applications, interviews, offers, employment, job changes/resignation, career previews, and player-controlled promotion offers exist. Employer operations, persistent vacancies, workplace decisions, layoffs, benefits, bonuses, and monthly payroll remain incomplete.
- **Finance:** broad systems exist for accounts, cards, savings, loans, recurring payments, property, multi-asset investments (broad index, technology and energy shares, government bonds, and gold), business ownership, taxes, credit scoring, loan eligibility/rejection scoring, and economic indicators. The weekly-to-monthly settlement transition is not complete; salary and recurring financial settlement remain annual, a known pacing limitation.
- **Family:** persistent people/relationship graph, bonds, targeted interactions, family history, and ledger-backed adult support exist. Partnership, parenthood, adoption, dependants, caregiving, family mortality, inheritance, and generational play remain planned.
- **Health and wellbeing:** stress/workload, stamina/recovery, checkups, counselling, and basic treatment loops exist. Broader illness, chronic care, insurance, localized healthcare, and later-life health remain planned.
- **UI foundation:** reusable Svelte primitives and semantic design tokens are established; AMOLED remains the default, with selectable themes. Recent UI work consolidated navigation, compact activity choices, weekly finance interactions, and shared spacing/hierarchy patterns. Visual QA remains ongoing.
- **End-to-end life:** retirement, mortality, terminal character state, final life summary, and a complete birth-to-death playthrough are not implemented.

### Latest verified validation baseline

Focused validation inspected for Banking/credit-score PR #97 (2026-11-09) reported:
- Svelte check: **0 errors, 0 warnings**.
- Vitest: **159 tests passed** across 11 test files.
- Vite production build: passed.

This is a point-in-time PR validation baseline, not a guarantee about later commits or deployment. Re-run CI after subsequent changes.

### Current development priority

1. Stabilize and visually verify the shared UI system across themes and screen sizes; reduce actionable Svelte warnings. Include the planned accessibility fixes and mobile QA pass listed in the UI foundation section below.
2. Complete the weekly-to-monthly financial cadence, including payroll, recurring obligations, business cash flow, reporting, and exactly-once month/year boundaries.
3. Run integrated multi-week scenarios across childhood, education, employment, unemployment, family responsibilities, and later life.
4. Expand family and workplace lifecycles only after their cross-domain time, finance, health, and save contracts are testable.
5. Complete retirement, mortality, terminal state, final summary, and legacy before claiming a full-life simulator.

## Milestone 0 — GitHub-first foundation
- [x] Preserve product, gameplay, visual, architecture, and AI collaboration decisions.
- [x] Build web client and independent simulation boundary.
- [x] Build minimal Android WebView wrapper.
- [x] Add focused Actions validation and Pages deployment.
- [x] Produce installable APK artifact.
- [x] Verify web updates reach the installed app after fresh launch.

## Milestone 1 — First enjoyable life loop
Scenario-led character creation with coherent randomized identities; three independent local save slots; readable domain-native workspaces; meaningful age-appropriate activities with costs/consequences; explicit weekly progression; contextual events and life-history entries; three local save slots; strict current-schema validation and explicit unsupported-save reset tests; optional sound feedback.

Selectable starting ages are an entry point, not a claim that full childhood, education, retirement, or generational systems are complete.

## Milestone 2 — Age-specific progression and connected systems
- [x] Establish life-stage bands and enforce initial activity eligibility in both UI and simulation.
- [x] Add the initial age-derived education labels and study-progress foundation.
- [x] Add optional structured education-history and qualification records to the character model, plus generated stamina, focus, confidence, discipline, creativity, social skills and stress attributes.
- [x] Add a playable education catalogue from early learning and primary/secondary school through vocational, college, bachelor's, master's, doctoral and professional certificate/specialist routes.
- [x] Build the Education workspace with enrollment, automatic attendance and progression, subjects, grades, weekly study/assignment/assessment tasks, tuition, pause/resume and academic history.
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
- [x] Consolidate account discovery and owned accounts into one account list with account-specific deposits, withdrawals, transfers, automatic deposits and eligible autopay controls.
- [x] Add predefined bank-card products with credit-score/asset eligibility, APR, rewards and redeemable purchase rewards.
- [x] Add personal, mortgage, and business loan products with annual interest, scheduled installments, and extra repayments.
- [x] Add housing/property ownership, mortgages, rental choices, rental income, maintenance and sale, plus predefined property opportunities with differentiated appreciation, volatility and rental-yield profiles.
- [x] Add multi-asset trading for a broad market index, technology and energy shares, government bonds with annual coupons, and gold; include simulated price movement, open positions, brokerage and realized-gain tax, plus predefined small-business opportunities with differentiated operating profiles and management.
- [x] Add bounded economic cycles, inflation, growth and benchmark-rate indicators; link inflation to living costs, subscriptions, rental agreements, and market valuations.
- [x] Add simplified progressive income tax, rental/business income tax, annual property levy, and carried unpaid tax liability.
- [x] Add a simplified 300–850 credit score using payment history, utilization, debt and unpaid taxes; price personal, mortgage and business loans from the score, with eligibility checks and bounded penalties for rejected applications.
- [x] Add simplified brokerage/transfer fees and capital-gains tax on investment/property sales.
- [ ] Add full affordability checks and variable-rate debt.
- [ ] Add benefits and taxes after household budgets and financial flows are balanced.

- [x] Organize Finance around Banking, Business, Property, Investments, and Taxes; group accounts, cards, loans, savings, and vault inside Banking.
- [x] Rework the top-level Life destination label to Lifestyle and replace the former Discover / My services / Home subviews with Market / Subscriptions / Owned. Food is paid for immediately and scheduled as a BOUGHT weekly activity whose effects resolve during week advancement; reusable/permanent goods enter the owned inventory after checkout; provider plans reuse the shared recurring-payment system.
- [x] Separate School and Work into age-gated, domain-native destinations using existing simulation actions and save fields.
- [x] Consolidate wellbeing, Lifestyle, Family, Family tree, and Life story under the modular Life workspace; the decision-based Life tree remains a distinct planned/implemented view only where backed by `LifeTreeWorkspace.svelte`.
- [x] Expand Education with enrollment, automatic attendance and course progression, grades, weekly tasks, programme completion and education history.
- [x] Implement a weekly job board, visible role requirements, scheduled applications and interviews, expiring offers, acceptance/decline, career-path previews, player-controlled promotion offers, and voluntary resignation.
- [x] Add initial role-specific eligibility gates for focus, social skills, confidence, discipline and creativity alongside age, education, intelligence and experience.
- [ ] Expand work into a complete age-appropriate path spanning part-time work, internships, apprenticeships, skilled occupations, professional careers, management and flexible later-life work; connect it to real education and credential records.
- [ ] Add richer workplace interactions, employer structures, layoffs/job security, and persistent vacancies; do not display placeholder stages.

## Milestone 3 — Replace annual actions with the weekly gameplay cycle (core transition complete)

**Design decision:** weekly is the live playable time unit; monthly is the intended financial/reporting unit; yearly is the life-progression and current annual-settlement unit. Personal activities use a stamina budget; school/work are automatic background responsibilities and do not reserve calendar periods. Weekly review is simulation-backed and deterministic. Remaining work is listed separately below.

- [x] Specify and test pure date helpers: Monday–Sunday week boundaries, month/year rollover, leap years, birthdays, and age calculation.
- [x] Keep a compact date/week calendar for birthdays and time progression; do not simulate every hour or allocate daily periods. Education and employment are automatic weekly background responsibilities; workload is calculated from those obligations and selected activities.
- [x] Remove the Schedule workspace and timetable grid; the Advance review is the consolidated plan/outcome surface.
- [x] Centralize activity eligibility and validate weekly actions, stamina/money costs, and stamina allocation. Personal activities do not reserve calendar periods.
- [x] Complete the cutover from annual action tokens across personal activities, family interactions, event choices, business management, and contextual Work actions.
- [x] Make weekly activity selection contextual across School, Work, Family, Business, Events, and Life; no date/period entry is exposed to the player.
- [x] Resolve planned activities deterministically, apply gameplay effects, and charge accepted costs exactly once; reject and preserve a turn if a selected action becomes stale or exceeds the stamina budget.
- [x] Add deterministic, exactly-once weekly resolution with history, recap, and seven-day calendar advancement.
- [ ] Adapt remaining contextual events, deadlines, and delayed consequences to date/week boundaries.
- [ ] Move recurring payments, employment payroll, and business operating cash flow to explicit monthly/weekly due dates only where supported; retain annual taxes, market updates, and annual reviews at defined annual boundaries. Until then, salary and household settlement remain annual and are a known pacing limitation of the weekly loop.
- [ ] Prevent duplicate or skipped financial settlement across month/year boundaries; document rounding and payment-failure behavior.
- [x] Establish schema 6 as the sole supported save format with three independent slots, required calendar data, and a strict weekly action plan.
- [x] Reject unsupported older save formats without mutating their stored bytes; provide an explicit player-confirmed reset path instead of migration adapters.
- [ ] Add multi-week advancement only after single-week resolution is reliable; it must stop before important decisions, deadlines, events, birthdays, and payment failures.
- [ ] Complete the concise weekly review, add a monthly Finance statement when monthly settlement is implemented, and keep the annual life review separate from weekly recap.

**Acceptance:** A fresh schema 6 save can play several weeks with stamina-limited personal activities, automatic school/work responsibilities, contextual events, and persistent consequences. Month-end and year-end processing occur exactly once. Birthday/age eligibility changes on the correct date. Quiet weeks can be advanced quickly. Scenario tests cover a school-age child, employed adult, unemployed adult, and later-life character. Current-schema saves and all financial invariants remain intact; older save formats are intentionally unsupported.

## Milestone 4 — Personal Technology (after weekly time foundation)

**Goal:** add smartphones, laptops, and desktop PCs as useful optional assets connected to everyday life.

- [ ] Add Life → Personal Technology and integrate its products into the existing Lifestyle Market.
- [ ] Add a small fictional catalogue with category-aware capability tiers and new/used options.
- [ ] Implement individual device ownership/access records and current-schema save/load validation.
- [ ] Route purchases, repairs, and resale through the existing Finance transaction/ledger path.
- [ ] Add basic condition, repair, replacement, and age/guardian rules.
- [ ] Integrate a few real capability/access checks into School, Work, and Personal activities.
- [ ] Provide shared/school/work/public/non-digital alternatives so ownership is not a core progression paywall.
- [ ] Test children, teens, adults, low-income saves, failed purchases, repair, and shared access.

**Acceptance:** Device ownership and costs persist accurately; failed transactions are atomic; capabilities enable specific contextual opportunities; other domains do not duplicate device management; existing saves remain valid. Detailed rules: [PERSONAL_TECHNOLOGY.md](PERSONAL_TECHNOLOGY.md).

## Milestone 5 — Deepen School and Work into playable systems
- [x] Add education progression choices, enrollment, automatic attendance/progression, weekly assignments/exams, grades, tuition and academic history in the Education workspace.
- [x] Add recruitment stages with applications, interviews, offers, acceptance/decline, generated employer identity, and job-change/resignation flow in Work.
- [ ] Add persistent employer operations, workplace decisions, layoffs/job security, and role-specific skill development.
- [ ] Clarify the current-job card and add a read-only career-path preview with estimated salary/bonus ranges; see [CAREER_PROGRESSION.md](CAREER_PROGRESSION.md).
- [x] Connect general education, knowledge, career experience, performance, and role requirements to transparent readiness checks and player-controlled promotion offers without a universal fixed-week grind.
- [ ] Add role-specific skills, persistent vacancies, employer decisions, and promotion outcomes tied to workplace conditions.
- [x] Add job changes and voluntary resignation through the shared employment record. Employment type informs automatic background workload; job changes do not create calendar reservations.
- [ ] Add conditional bonuses/benefits, monthly payroll, career stability, layoffs, and deeper workplace progression only with complete finance and employer loops.

**Acceptance:** Education and career choices change future options and have visible consequences; no placeholder status is shown as a real mechanic.

## Milestone 6 — Persistent family and relationships (foundation implemented)

**Specification:** [FAMILY_SYSTEM.md](FAMILY_SYSTEM.md). The simulation-first foundation and targeted weekly interaction loop are implemented; lifecycle expansion remains staged. Family is: persistent people, validated kinship/guardianship graph, separate closeness/trust/tension, household/dependency state, and auditable family history.

- [x] Add current-schema family graph types and stable player/relative identities.
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
- [x] Migrate family interactions from annual actions to stamina-based weekly activity toggles.

**Acceptance:** Family is represented by real people and validated relationships, not a single score. Interactions materially affect the selected relationship and are recorded. Financial support cannot create money or hidden debt. Current-schema saves remain valid. Different family structures and child/adult/later-life scenarios are tested. No unimplemented partner, child, care, death, or inheritance state is shown as fact.

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


## UI foundation (implemented; visual QA ongoing)

**Current state reviewed 2026-11-09:** semantic tokens and shared primitives are in place, and the AMOLED default plus selectable themes are wired into Settings. Recent merged work has also tightened compact activity presentation, topbar ordering, workspace hierarchy, spacing, and empty states. A Modern Web Guidance review of the live site and source code identified follow-up work below. These findings are a planned backlog, not completed fixes. Do not treat the current foundation as proof that every screen is visually consistent: continue screenshot-based checks across all themes, narrow/mobile widths, dialogs, navigation, and long content. Keep reusable components small and pattern-driven; do not create abstractions for one-off UI.

### Planned task — accessibility and responsive UI audit

**Source:** Modern Web Guidance review of the deployed game and source code, 2026-11-09. The live review reached the main menu, Settings, and character-creation flow. It did not complete gameplay-workspace coverage or a full mobile/theme matrix. Automated observations were cross-checked against source; existing `lang="en"`, global `:focus-visible` styling, native `<details>/<summary>` settings disclosure, reduced-motion handling, three save slots, and the character-creation mobile grid were verified and are not listed as defects.

- [ ] Replace custom modal behavior with native `<dialog>` where appropriate, or complete the equivalent accessible modal contract: focus moves into the dialog, remains contained while open, Escape closes when safe, focus returns to the invoking control, and background content is unavailable while modal. Audit the weekly finance breakdown and save-management dialogs first.
- [ ] Give the character life-stage picker semantic group/fieldset structure and expose each option's selected state (for example, `aria-pressed` on toggle-style buttons). Preserve its current visual selection treatment and age-generation behavior.
- [ ] Put the title screen inside a semantic `<main>` landmark and add a visible-on-focus skip link to the primary content. Ensure each application screen has a clear page landmark and heading hierarchy.
- [ ] Review character-creation typography and shared metadata labels. Raise essential 8–10px text to a readable shared type scale where possible without losing the compact layout; verify contrast in every theme.
- [ ] Make the exit/close action's label and explanatory feedback platform-aware: do not promise that a browser tab will close when the browser prevents it, while preserving the Android wrapper's supported exit behavior.
- [ ] Run a real narrow-screen pass on Android-sized viewports for the main menu, character creation, Overview, Life, Finance, Education, Work, Family, Settings, weekly review, and all dialogs. Check horizontal overflow, wrapping, centering, safe areas, scroll containment, and touch-target sizing.
- [ ] Repeat the same visual/contrast/focus checks in AMOLED, Midnight, Graphite, and Paper themes. Capture before/after screenshots for any layout fixes.
- [ ] Run keyboard-only checks (Tab/Shift+Tab, Enter/Space, Escape), screen-reader semantics checks for selected states and dialogs, and reduced-motion checks.
- [ ] Run Svelte checks, the complete Vitest suite, and the production build after implementation; record exact results and distinguish existing warnings from new regressions.

**Acceptance criteria:** no modal traps keyboard focus outside itself or loses the invoking focus on close; all interactive selections expose their state semantically; the title screen has a usable main landmark and skip path; essential text is readable at phone widths and in all themes; no audited screen has unintended horizontal overflow or clipped controls; browser and Android exit behavior is accurately described; all existing gameplay/save behavior remains unchanged. This task is QA and accessibility hardening, not a visual redesign or permission to add new gameplay features.

- Establish semantic design tokens and reusable Svelte primitives before expanding the component catalogue.
- Keep AMOLED as the default and add explicit, locally persisted player themes through Settings → Appearance.
- Migrate repeated controls and surfaces to semantic tokens; preserve each domain's own visual language and avoid a generic dashboard/card system.
- Shared primitives and semantic color migration are implemented across the current screens. Expand the component set only when multiple screens have a real repeated pattern. Verify contrast, focus, touch targets and responsive behavior across every theme.


## Milestone — Lifestyle quality and financial progression

**Goal:** Make money change the quality, safety, and range of everyday life without reducing the system to a single expensive-is-always-best stat bonus. See [LIFESTYLE_ECONOMY.md](LIFESTYLE_ECONOMY.md).

- [ ] Add food choices with clear price, nutrition, health, energy, and convenience trade-offs; include low-cost fast food, basic meals, balanced meals, and premium/gourmet options.
- [ ] Make food quality affect nutrition and health over time, with affordability and access constraints appropriate to the character's age and household.
- [ ] Add quality tiers for useful everyday goods and services, where durable/reliable items reduce risk or recurring costs and premium options offer comfort or efficiency rather than raw universal stat boosts.
- [ ] Connect lifestyle purchases to the existing cash/card/ledger transaction system; never create a second wallet or bypass affordability checks.
- [ ] Model the transition from budget survival to financial stability and affluence: savings/investment capacity, emergency resilience, better choices, and lower exposure to avoidable risks.
- [ ] Ensure low-income characters retain viable low-cost choices; premium goods must not become mandatory progression gates.
- [ ] Test contrasting scenarios: financially constrained student, working adult saving toward stability, and affluent character choosing higher-quality living.

**Acceptance:** Money has meaningful short-, medium-, and long-term value. Cheaper options remain viable but carry understandable trade-offs; better-quality options provide grounded benefits at proportionate prices; purchases are recorded atomically and cannot bypass available-funds rules.

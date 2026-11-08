# Project Status & Development Priorities

**Repository:** [MasfikurDev/My-Life-Simulator](https://github.com/MasfikurDev/My-Life-Simulator)  
**Reviewed:** 2026-11-09  
**Purpose:** A concise, evidence-based snapshot of what is implemented, what is only a foundation, and what remains planned. This document summarizes the canonical specifications; it does not replace them.

## Product direction

My Life Simulator is an Android-first, mobile-friendly life simulation with a web client. The game uses compact text, cards, buttons, and domain-native workspaces—not a 3D world or a generic life-administration dashboard. Money remains prominent in the overview, while education, work, family, health, and personal life remain meaningful connected systems.

The playable time model is:
- **Week:** player decisions, automatic education/work responsibilities, stamina-based activities, and turn resolution.
- **Month:** intended recurring financial settlement and reporting cadence (not yet fully implemented).
- **Year:** age/life progression and annual settlement/review boundaries.

Do not reintroduce a universal three-actions-per-week quota. Personal activities are toggled in their owning workspaces and use a shared stamina budget. Education and employment are automatic background responsibilities; there are no player-managed timetables, period reservations, or Schedule workspace.

## Weekly activity model (current follow-up implementation; CI verification pending)

- Personal activities are selected with direct add/remove toggles in their owning workspaces and consume activity-specific stamina.
- Recurring school/work commitments remain in the calendar; personal actions do not take time slots.
- The Schedule workspace is a combined review/cancellation surface for selected personal activities and recurring commitments.
- The Advance dialog previews every selected activity's stamina/money cost, reward categories, deterministic projected stat changes, and wellbeing warnings using the same weekly resolver as actual advancement.
- The feature branch has a pull request open; final CI verification is pending.

## Implementation snapshot

| Area | Status | Implemented foundation | Main remaining work |
|---|---|---|---|
| Character creation and saves | Implemented foundation | Randomized character profiles, age-aware creation, three save slots, migration/recovery support | Broader scenario validation and deeper life-stage content |
| Weekly simulation | Core implemented | Calendar, date/week calendar, automatic education/work obligations, stamina-based personal activities, deterministic resolution, history and recap | Date-based deadlines, richer delayed consequences, multi-week advancement |
| Education | Playable foundation | Enrollment, programmes, classes, weekly tasks, grades, tuition, history, qualifications | Localization, scholarships, retakes, licensing, apprenticeships |
| Work | Playable foundation | Job board, applications, interviews, offers, employment, job changes, resignation, career previews and promotion offers | Persistent employers/vacancies, workplace decisions, layoffs, benefits, bonuses, monthly payroll |
| Finance | Broad foundation | Accounts, cards, savings, loans, recurring payments, property, investments, business, taxes, credit score and economic indicators | Monthly payroll/bills/business cash flow, settlement safety, reporting, deeper affordability and variable-rate debt |
| Family | Foundation + initial interactions | Persistent people and relationship graph, bonds, history, targeted interactions, ledger-backed adult support | Partnership, separation, parenthood, adoption, dependants, caregiving, family events, mortality and legacy |
| Health/wellbeing | Basic playable foundation | Stress, workload, stamina, recovery, checkups, counselling and basic treatment | Broader conditions, chronic care, insurance, localized healthcare, aging and later-life support |
| Events and life history | Initial system | Contextual events, choices, persisted pending events, consequences and history | Date-based deadlines, richer cooldown/content, milestone arcs and cross-domain follow-through |
| Personal technology | Planned | Design specification exists | Device ownership, access, capability checks, repairs and purchase loop |
| Retirement and mortality | Planned | High-level direction and acceptance criteria | Pension/retirement, terminal state, final summary, estate and legacy |

A workspace or UI control is not proof that its entire domain is complete. The simulation state, validation, persistence, accounting, and tests determine implementation status.

## UI and design-system status

- AMOLED remains the default theme.
- Selectable themes and persisted appearance preference are implemented.
- Semantic design tokens cover shared spacing, radii, control sizing, surfaces, text, borders, and focus treatment.
- Reusable UI primitives exist for repeated buttons, cards, section headers, empty states, and theme options.
- Recent work has improved topbar ordering, compact activity choices, weekly finance drill-down, workspace hierarchy, spacing, and empty states.
- Visual consistency is still under active QA. Check alignment, padding, centering, density, responsive behavior, contrast, focus states, and dialog layouts across all themes. Avoid adding one-off CSS patterns when a shared semantic token or reusable component already covers the need.
- **Planned accessibility and responsive QA pass:** address custom-dialog keyboard/focus behavior, expose character life-stage selection state to assistive technology, add a main landmark and skip link to the title screen, review very small text on character creation, and make the exit action's wording platform-aware. Then verify gameplay workspaces on narrow phones and across all four themes. These are planned follow-ups from the 2026-11-09 Modern Web Guidance review, not yet implemented.

## Verified engineering baseline

Latest inspected successful GitHub Pages workflow on 2026-11-08:
- Svelte check: 0 errors and 19 warnings across 7 files.
- Vitest: 150 tests passed across 10 test files.
- Vite production build: passed.
- Pages artifact upload and deployment: passed.

The same run included Node.js/dependency deprecation notices. These are maintenance warnings, separate from application test failures. This snapshot must be refreshed after later code changes; never imply a current green build without checking the latest workflow.

## Priority order

1. **UI stabilization:** finish visual QA across screens, themes, and mobile widths; fix real inconsistencies; reduce actionable diagnostics.
2. **Financial cadence:** move supported recurring obligations and payroll to explicit due dates; add monthly statements; guarantee exactly-once processing across month/year boundaries and define insufficient-funds behavior.
3. **Integrated scenario testing:** run repeatable multi-week scenarios for school-age, teen, employed, unemployed, independent-household, family-responsibility, and later-life characters.
4. **Family lifecycle:** partnership, separation, parenthood/adoption, guardianship, dependants, and caregiving—only with complete graph, time, finance, health, persistence, and history contracts.
5. **Workplace depth:** employer state, persistent vacancies, workplace decisions, job security, role-specific skills, benefits, bonuses, and realistic compensation.
6. **Later-life completion:** retirement, mortality, terminal character state, final life summary, estate/legacy, then full birth-to-death balancing.
7. **Replayability:** varied authored events, meaningful life paths, balance, edge cases, and repeatable full-life playthroughs.

## Explicit non-goals and guardrails

- Do not add a 3D world or simulate every hour/NPC.
- Do not turn every domain into the same generic card dashboard.
- Do not make players manually enter dates or periods for routine activities; use direct add/remove toggles and stamina costs.
- Do not add duplicate finance ledgers or duplicate ownership of cross-domain state.
- Do not claim planned lifecycle features are implemented because a navigation item or placeholder exists.
- Do not optimize for WASM or other low-level performance work before profiling demonstrates a real bottleneck.
- Do not add cloud/social/monetization complexity before the core single-player life loop is coherent and fun.

## Canonical documents

- [Roadmap](ROADMAP.md) — milestones, acceptance criteria, and implementation order.
- [Gameplay loop](GAMEPLAY_LOOP.md) — calendar, weekly scheduling, turn resolution, and connected gameplay.
- [Family system](FAMILY_SYSTEM.md) — people, relationships, lifecycle, and cross-system contracts.
- [Career progression](CAREER_PROGRESSION.md) — recruitment, compensation, promotion, and work progression.
- [Personal technology](PERSONAL_TECHNOLOGY.md) — device ownership and capability integration.


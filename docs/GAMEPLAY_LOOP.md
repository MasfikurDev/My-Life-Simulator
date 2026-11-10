# Gameplay Loop Redesign

**Canonical game-design implementation plan · Weekly-cycle direction · Reviewed 2026-11-10**

This document turns the gameplay audit into a staged, implementation-ready direction. It distinguishes the implemented first slice from planned mechanics.

## Current implementation status · 2026-11-10
The weekly gameplay foundation and the annual-action-to-weekly-turn transition are implemented in the web simulation:
- Contextual events are selected using character/year context and age/health eligibility.
- Pending events and choices persist in the character save; the simulation validates choice requirements and costs.
- Personal activities, family interactions, social-circle interactions, business management, job applications, interviews, and time-consuming event choices are selected as weekly actions, consume stamina where appropriate, and resolve in deterministic order.
- Passive lifestyle activities are derived from household/family culture, explicitly recorded social connections, and the current residence. They are shown separately from removable planned activities, do not consume planned stamina effort, and apply bounded health, happiness, comfort, discipline, stress, and stamina effects during deterministic weekly resolution.
- Lifestyle includes groceries/prepared meals, restaurant/delivery meals, clothing purchases, subscriptions, and owned goods. Clothing condition wears gradually and presentation modestly affects interview first impressions; housing comfort derives from existing rental/owned property and household circumstances.
- Weekly resolution applies effects and costs, records Life History, clears resolved actions, and advances the calendar by seven days. A stale planned action blocks the turn and remains available for repair instead of being silently discarded.
- Age and life-stage eligibility change on the character's birthday. Annual financial settlement and annual event expiry remain at the year boundary.
- The current save format stores three independent slots and validates every current character before use.

Still planned: date-based event deadlines and richer event cooldown/content, monthly financial settlement and reporting, broader cross-domain consequences, family lifecycle expansion, deeper chronic-care/insurance/healthcare localization, retirement, mortality, and terminal-life completion. Education has enrollment, automatic attendance/progression, weekly academic tasks and grades; Health has stress/workload, recovery, counselling, check-ups and basic condition/treatment loops. Work has a functional first recruitment/employment/promotion loop, but employer operations and monthly payroll are not complete. Finance has broad banking, debt, property, investment, tax, business, and credit foundations, but recurring financial settlement is still annual. The UI has moved to reusable primitives and semantic theme tokens, with visual QA still ongoing. The complete birth-to-death redesign is not finished.

**Verified focused validation baseline (2026-11-09):** Banking/credit-score PR #97 passed Svelte checking with 0 errors and 0 warnings, 159 tests across 11 files, and the Vite production build. Main CI run #482 also passed after the PR was integrated. These are dated validation results, not a guarantee about later commits or deployment; re-run the repository workflow after changes.

## 1. The game we are making

My Life Simulator is a replayable, week-by-week life simulation game, with monthly financial rhythms and yearly life-stage progression. The player guides one character from a chosen starting stage through a changing life, makes decisions under limited time and resources, experiences authored and emergent situations, and eventually reaches a meaningful ending.

The experience must feel like playing a game:
- Give the player a clear reason to make decisions each week, with larger milestones across months and years.
- Present interesting trade-offs, opportunities, setbacks, and surprises.
- Make actions and events change the character's future, not just the current stat bars.
- Give feedback that makes consequences understandable and memorable.
- Make different lives produce different stories and viable paths.
- Keep the pace quick enough for short mobile sessions, with enough depth for long playthroughs.

It is not a financial dashboard, a life-administration app, a spreadsheet, or a passive sequence of stat changes. Finance remains an important game system and money remains the primary dashboard metric, but money is one part of a wider life story.

## 2. Design lessons from the genre

Use proven genre patterns as inspiration, not as templates to copy:

- **BitLife:** A readable year-by-year life timeline, broad life paths, frequent contextual decisions, and a complete birth-to-death arc make a life easy to play in short sessions. Borrow the cadence and breadth of possibility; create original events, mechanics, writing, progression, and presentation.
- **The Sims:** Needs, relationships, traits, and interactions become interesting when they influence one another and generate situations. Borrow the idea of interacting pressures and emergent outcomes; do not attempt a real-time 3D world or simulate every person continuously.
- **Reigns and choice-led narrative games:** Compact situations with distinct options and visible trade-offs make decisions fast to understand. Borrow concise dilemma presentation; do not reduce the whole simulation to four balancing meters or make every choice a binary moral test.
- **Meaningful-choice design:** A choice should be visible before selection, informed enough to reason about, have a real outcome, and be remembered by the game. A consequence that never changes later play is usually cosmetic.

Our differentiator is a connected, age-aware life simulation with domain-native systems, an understandable financial life, persistent relationships, and consequences that carry across years.

## 3. The weekly gameplay loop

**Decision: the week is the fundamental playable time unit.** Months organize recurring finances and reports; years organize birthdays, life-stage transitions, annual milestones, and long-term reviews. The old three-actions-per-year budget is retired. Do not replace it with a weekly action quota: the loop uses a stamina-backed weekly activity plan and automatic education/work responsibilities.

The player should feel that a life is unfolding, not that they are spending abstract action tokens. A normal week should take a few deliberate choices and resolve quickly. Quiet weeks are allowed; important weeks can contain more decisions.

### 3.1 Time model and calendar

- Use a continuous, deterministic game calendar with an explicit current date and week boundary. A week runs Monday through Sunday; the calendar must handle month/year boundaries and leap years correctly.
- Keep the displayed age derived from date of birth and current date. Age changes on the character's birthday, not every week or at every month boundary.
- The current calendar year remains the world year. Advancing one week must never accidentally age the character by one year.
- The player advances exactly one week at a time through an explicit **Start next week** action. No screen visit, save/load, or background process advances time.
- Provide a compact calendar/week view, not a real-time clock or hour-by-hour simulation.
- Do not simulate 168 individual hours, every NPC, travel minute, or every day autonomously. The game combines player-planned stamina-backed choices with meaningful automatic household, social, education, and employment routines.

### 3.1.1 Calendar foundation (implemented first slice)

- The simulation uses strict ISO date-only strings (YYYY-MM-DD), interpreted in UTC for deterministic arithmetic. There are no local-time or daylight-saving transitions in the game calendar.
- Weeks run Monday through Sunday. The calendar exposes the Monday week start even when a date falls later in that week; advancing a week moves the date forward by exactly seven days.
- New characters receive an initial calendar anchored to the first Monday on or after January 1 of their starting game year. Their birth date is placed on the same month/day in the year implied by their chosen starting age, preserving that age at creation.
- Age is calculated from birth date and current date, not from the number of week advances. A birthday changes age only when the current date reaches the birthday.
- For a February 29 birth date in a non-leap year, the game observes the birthday on March 1. This is a consistent game-calendar convention, not a legal-age rule.
- The current save baseline requires a valid calendar and weekly plan. Older schema versions are not migrated; they remain untouched until the player explicitly confirms a reset.
- Calendar helpers, weekly advancement, weekly activity resolution, and birthday-based aging are implemented and tested. Monthly settlement, date-based event deadlines, and recurring payment cadence remain future work.

### 3.2 Weekly activity plan: stamina and automatic responsibilities

The week is shaped by the character's automatic responsibilities and the player's optional activity choices. There is no player-facing timetable or day/period allocation.

- Education and employment continue as background responsibilities while the character is enrolled or employed. Attendance, participation, and progression resolve automatically; they do not create calendar blocks or require manual scheduling.
- Optional activity rewards combine immediate effects with pursuit-specific capability progress and, where modeled, future eligibility or opportunities. See section 3.2.2.
- Optional personal activities are toggled from their owning workspaces. The same weekly plan is summarized in the Advance review.
- Selecting an activity reserves its stamina cost in the plan; it does not immediately deduct the character's stamina.
- Recovery activities such as rest and bought meals contribute to the weekly stamina budget. Passive household/social recovery is also credited before planned activity costs, but it is not a player-selected activity and cannot be removed.
- A plan is valid only when `min(100, current stamina + planned recovery + passive recovery) - planned activity costs >= 0`. The Advance review blocks an over-budget plan and must never show negative projected stamina.
- Passive activities are derived from actual state: family meals depend on co-resident family and family culture; partners, friends, children, and extended relatives contribute only when explicitly recorded; housing comfort depends on the actual residence and household arrangement. Passive entries are greyed out and unremovable in Weekly Review, and never increase planned activity workload.
- Passive effects can improve stamina, health, happiness, comfort, and discipline, or add realistic pressure/responsibility. Children can add responsibility, strained/neglectful family cultures provide less support, and independent living removes family-provided meals.
- Food is a deliberate purchase: everyday meals, eating out, and delivery are paid for and scheduled into the current week. Food is consumed on resolution and never stored in Owned. Effects include bounded stamina, health, happiness, comfort, and stress changes.
- Housing remains an active adult responsibility through the existing rental and property-purchase flows. Housing quality feeds passive comfort; rent and property costs remain financial obligations.
- Fashion is a durable purchase in Owned. Clothing has style, formality, and condition; condition wears gradually. Presentation has a modest effect on interview first impressions and must never override qualifications, skills, or interview readiness.
- Natural weekly fatigue/recovery is applied separately from the reserved activity budget and appears in the final forecast.
- Stamina is not the only limit. Background education/work responsibilities and demanding activities contribute to workload. Excessive workload increases stress and can reduce health, focus, learning efficiency, work performance, and recovery.
- Rest can restore stamina and reduce pressure, but it does not erase the workload that caused stress. Recovery choices should be meaningful trade-offs, not a free reset button.
- Activities show their stamina cost, expected reward categories, direct money cost where relevant, and a clear add/remove toggle. Planned activities carry a visible PLANNED seal that does not block toggling them off.
- Some contextual event choices resolve immediately; others join the weekly plan. The choice's authored requirements and affordability determine whether it can be selected, not a free calendar slot.

**No universal action quota:** the player may plan many or few activities. Stamina, affordability, prerequisites, stress, health, and other modeled constraints determine what the character can sustain. The game does not require the player to fill a calendar.

### 3.2.1 Current weekly action record

- Schema 7 stores a versioned `weeklyPlan` containing contextual actions only, including planned social time and bought food comfort effects. Each action has a stable ID, owning domain, and explicit action payload.
- Planned actions do not contain dates, weekdays, periods, durations, or recurring commitments. The game calendar tracks week progression; it is not a timetable.
- Enrollment, resuming education, hiring, changing jobs, and resignation update domain state only. Education and employment are automatic background responsibilities and never create time-slot reservations.
- The old Schedule workspace and its seven-day/21-period grid are removed. The Advance review is the single consolidated plan and outcome surface.

### 3.2.3 Age-aware stat development

**Decision:** core attributes and wellbeing stats have age-dependent development ceilings. Age controls the broad ceiling; personal potential narrows it; opportunities and player choices determine how quickly the character approaches it.

- New characters receive age-appropriate starting values. Children begin with substantially lower health, stamina, intelligence, fitness, focus, confidence, discipline, creativity, social skills, happiness, and comfort than adults.
- Age ceilings rise gradually through childhood, adolescence, and young adulthood. Different stats use different curves; physical capacity peaks and declines differently from cognitive and social capabilities.
- Each character has optional per-stat potential values. The field is backward-compatible; missing potential defaults to 100.
- Natural development resolves once per successfully completed week. It is gradual, age-sensitive, and does not require scheduling basic childhood development. Supportive/structured family culture improves the rate; strained/neglectful environments, poor health, low stamina, and sustained high stress reduce it. Passive family care supports development from birth; guided study unlocks at age 3, and player-directed exercise and social activities unlock at age 2.
- Activities and environmental effects can improve relevant stats, but positive weekly gains cannot exceed the current effective ceiling. Existing above-ceiling values in older saves are preserved rather than forcibly reduced.
- Natural development does not replace active growth. Exercise, education, social interaction, and other pursuits remain the main way to build high capabilities. Neglect and adverse circumstances can offset gains.
- Stress remains an inverse pressure meter, not a developmental capacity.
- Weekly review previews natural development alongside planned and passive outcomes.

The first implementation uses conservative provisional curves. Tune them through deterministic child-to-adult and goal-driven simulations; do not treat the initial values as final balance.

### 3.2.2 Pursuit-based activity rewards

**Reward design:** activities must advance the life direction they represent, not simply exchange stamina for broad attribute increases. Evaluate an activity across three layers:

1. **Immediate effects:** short-term wellbeing, stamina, money, relationship changes, or performance.
2. **Pursuit capability:** durable, domain-relevant skill or knowledge that accumulates through repeated meaningful choices.
3. **Future consequences:** eligibility, opportunities, specializations, and advantages that become available when capability and other requirements are met.

Not every activity needs all three layers. Do not award unrelated skills or inflate every stat for every action. Routine school, work, household, and care responsibilities continue to resolve automatically.

**Implemented first slice:**
- Study builds knowledge associated with the current education field; independent study builds a general-learning capability when no field is active.
- Education study, assignments, and assessments add different amounts of field capability. Programme grades and qualifications continue to resolve through the education system.
- Exercise develops physical-fitness capability alongside its immediate fitness, health, happiness, stamina, and stress effects.
- Social time develops communication capability as well as relationship quality and wellbeing.
- Extra work adds a small amount of capability in the current career path; career development adds a larger amount and continues to improve work performance.
- Mid- and senior-level career roles now include a relevant career-skill threshold in addition to their existing age, education, attribute, qualification, and experience requirements.
- The weekly review forecast includes durable skill changes so the player can see progress before advancing.
- Older saves without stored skill values use existing related attributes as a starting estimate. Once a skill is developed, its saved value becomes the progression track.

**Design guardrails:**
- Capabilities should be specific enough to make a chosen direction matter, but not so granular that players manage dozens of nearly identical skills.
- A skill threshold is one part of eligibility, not a substitute for qualifications, experience, health, relationships, money, or other relevant requirements.
- Skill growth should be affected by fatigue and stress; repeating an action under poor conditions should be less efficient.
- Activities must explain the capability they develop and why that capability matters. Weekly review must show the actual forecast, not a generic reward promise.
- Unlocks should create new choices and viable paths, not mandatory chores. A player who ignores one pursuit must still have other ways to build a satisfying life.
- Keep immediate stat changes modest where a durable capability is the meaningful reward. Do not make one activity the best answer for every outcome.

Future expansion should add capabilities only when a real system consumes them. Specializations and opportunity chains should be introduced with the relevant education, career, business, health, or social systems rather than as disconnected skill meters.

### 3.3 The week in play

**Phase A — Open the week**

Show a compact "This week" view:
- Date range, current age, and relevant life stage.
- Automatic education/work responsibilities where the character is enrolled or employed.
- Background education/work responsibilities and activities selected for this week.
- Current money position and near-term payments only when the values are modeled.
- Pending events, opportunities, deadlines, and important consequences.
- At most a few relevant prompts; do not duplicate whole domain dashboards.

**Phase B — Make choices in their own workspaces**

The player visits the relevant domain and chooses what to do:
- **Education:** progress through education automatically, plan study/assignment/assessment tasks, maintain grades, progress through courses and earn qualifications. Missing weekly learning targets lowers grades.
- **Health:** monitor condition and pressure, plan rest/mindfulness/counselling/medical check-ups, and manage treatment. Workload and sustained stress can cause burnout and reduce task efficiency.
- **Work:** attend shifts, perform work activities, develop skills, pursue opportunities, and respond to workplace situations when implemented.
- **Life:** wellbeing, personal growth, relationships, family, recreation, and personal commitments.
- **Finance:** banking, spending, saving, debt, assets, household planning, and business decisions.
- **Lifestyle:** food and fashion purchases, subscriptions, Owned inventory, family/social connections, and everyday living conditions; housing purchase/rental remains in Finance → Property.

Every activity must state its stamina cost, monetary cost/income where relevant, prerequisites, and meaningful stat/skill effects before confirmation. Only charge resources after the simulation validates and accepts the activity. Activities that fail validation must leave the save unchanged.

**Phase C — Handle events and interruptions**

Events appear when context justifies them. Some require a response now; others create a deadline or scheduled follow-up. A week should not be forced to contain a dramatic event. Prioritize coherent personal stories over random notifications. A player must not be able to avoid a critical deadline simply by leaving the event screen open forever; deadline and expiry rules must be explicit.

**Phase D — Review the week**

Before advancing, summarize:
- Activities completed and time used.
- Commitments fulfilled or missed, with the actual consequences.
- Unresolved events and deadlines that will expire or change.
- Known upcoming payments or income.
- Expected changes that are predictable, and uncertainty where outcomes are not guaranteed.

Do not repeat all financial account details or all school/work details. Link to the owning domain for detail.

**Phase E — Resolve and recap**

The player explicitly confirms **Start next week**. The simulation resolves the week once, in a deterministic order, then displays a concise recap with the most important outcomes and their causes. The recap is based on actual simulation effects, not UI guesses.

### 3.4 Monthly and yearly rhythms

**Monthly layer**
- Process monthly salary/payroll only when employment contracts and pay cadence support it.
- Process recurring subscriptions, household bills, loan installments, card obligations, savings contributions, and other monthly obligations on their actual due dates/cadence.
- Produce a monthly financial statement/summary in Finance, not as a large global dashboard.
- Handle month boundaries without double-charging or skipping due dates.
- Existing annual financial mechanics must be migrated deliberately. Do not simply divide annual values by 12 without considering rounding, due dates, interest, and inflation.

**Yearly layer**
- Birthday and age progression occur on the actual birthday.
- Resolve school-year transitions, annual salary review, taxes, annual interest, market updates, insurance/contract renewals, and other annual mechanics only at their defined annual dates.
- Present an annual life review that highlights milestones and longer-term trends; do not make the player perform 52 weekly recaps manually.
- Life-stage eligibility changes at the relevant birthday/date boundary and is enforced in simulation functions as well as UI.
- Annual financial settlement must not repeat an obligation already processed monthly.

### 3.5 Deterministic week resolution

The exact order is a domain contract and must be tested. Proposed order:
1. Validate the weekly activity plan and its non-negative stamina budget.
2. Resolve automatic education/work responsibilities and selected player activities; no time-slot conflict resolution occurs.
3. Resolve deadlines and events due during the week, recording choices and consequences.
4. Apply weekly recurring income/expenses only when their due dates fall in this week.
5. Update bounded wellbeing/skill/progression effects from what actually happened.
6. Resolve scheduled follow-ups due this week.
7. Move the calendar to the next week and detect month/year/birthday boundaries.
8. At a month boundary, process monthly settlement exactly once.
9. At a year boundary, process annual settlement and the annual review exactly once. Age and birthday-triggered life-stage transitions are processed on the actual birthday, including when it falls mid-year.
10. Prepare the next week's automatic responsibilities and eligible event opportunities.
11. Return structured effects, ledger entries, history entries, and recap data.

The final order may be adjusted to satisfy domain dependencies, but it must remain deterministic, idempotent against duplicate UI calls, and covered by boundary tests. Financial transfers, income, bills, interest, and expenses must never be applied twice if the player retries, reloads, or resumes a save.

### 3.6 Pacing and player control

- A normal week should be playable in a short mobile session: review, make a small number of meaningful choices, resolve, and continue.
- Add **Skip quiet week / advance several weeks** only after single-week resolution is reliable. It must stop before birthdays, deadlines, important events, payment failures, job/school milestones, or other decision points.
- Bulk advancement must resolve every intervening week in order; it must not skip simulation or collapse several weeks into one approximate calculation.
- Offer clear pause points and a way to inspect the calendar/history without advancing time.
- Do not punish players for taking a break or for not opening the game in real time. All time is simulated only by explicit player commands.
- Avoid mandatory repetitive attendance clicks. Routine education/work participation resolves automatically, while absences, performance choices, conflicts, and important situations require player agency.
- Do not make every week a checklist. The player should be able to make no discretionary choice in a quiet week and continue without penalty beyond the consequences of modeled commitments.

### 3.7 Weekly loop acceptance tests

A playable weekly loop is not complete until:
1. A new player can understand the current week, automatic responsibilities, stamina budget and next action without reading documentation.
2. Personal activities can be toggled in their owning workspaces without choosing a date or period.
3. The weekly review lists all selected activities with costs, planned recovery, reward categories and projected combined outcomes; no Schedule workspace exists.
4. The player can combine demanding activities with recovery and see the non-negative stamina budget regardless of selection order.
5. School/work responsibilities progress automatically without calendar reservations.
6. A weekly activity can create a meaningful immediate effect and a persistent delayed consequence.
7. One week advances exactly once; retry/reload cannot duplicate income, bills, effects, or history.
8. Crossing month-end processes monthly payments once after monthly settlement is implemented; current annual settlement remains exactly once at year boundaries.
9. A birthday changes age and eligibility on the correct date, not simply every 52 button presses.
10. Current-schema saves load without data loss. Unsupported old formats are rejected without mutation and require explicit confirmation before reset.
11. A quiet week can be advanced quickly without fake chores or forced dramatic events.
12. Multi-week scenario tests produce coherent results for a child in school, an employed adult, an unemployed adult, and a later-life character.

### Current save baseline

Schema 6 is the sole supported persisted format. It contains three independent slots, required calendar dates, a versioned weekly action plan, and current domain state. The storage layer validates the complete envelope and action payloads before use. Older schema versions are intentionally unsupported: the app leaves their data untouched, explains that a fresh start is required, and only clears the old save after explicit player confirmation. No migration or compatibility adapter is maintained.

### Current implementation boundary

The app has a date-based weekly calendar, a stamina-backed activity plan, and a reproducible, exactly-once weekly resolver. Age and birthday-triggered life-stage transitions follow the character's actual birth date. Monthly settlement and date-based recurring payment schedules remain future work; annual income, expenses, taxes, asset settlement, and annual reviews still run at the year boundary.

### Weekly turn experience

A simulated week is the basic playable turn; a month is the intended financial/reporting interval; a year is a life-progression chapter.

### Phase A — Open the current week
Present a compact current-week view containing:
- Current age, life stage, year, and the most relevant changes since last year.
- Current circumstances that affect decisions: school/education, work, household, money, health, and important relationships when implemented.
- New opportunities, unresolved situations, upcoming commitments, and warnings.
- A small number of relevant goals or pressures. Do not dump every system's data onto one screen.

### Phase B — Make life decisions
The player chooses from age- and circumstance-appropriate actions in the relevant domain workspaces:
- Education: enrollment, automatic education progression, weekly study/assignment/assessment tasks, grades, course milestones and qualifications.
- Work: job search, applications, career development, workplace choices, and later retirement decisions.
- Life: wellbeing, personal growth, relationships, family, recreation, and personal commitments.
- Finance: banking, spending, saving, debt, assets, household planning, and business decisions.
- Lifestyle: services, purchases, and home arrangements.

Actions have explicit costs and trade-offs: stamina, money, risk, or an opportunity cost. Explain important costs before confirmation. Do not add an arbitrary universal weekly action quota or extra meters merely to make the loop feel busy.

**Contextual activity selection is the default interaction contract.** Offer an action in the domain where its purpose is clear (for example, an interview in Work, a family interaction in Family, or exercise in Health). The player's confirmation adds or removes it from the current weekly plan. Validate eligibility, affordability, and the stamina budget; do not ask for dates, weekdays, periods, or calendar slots. The Advance review is the single place to inspect the combined plan and forecast.

The player may leave stamina unused and advance deliberately. Do not silently auto-spend selected activities or auto-advance time. Quiet weeks must remain quick to resolve.

### Phase C — Resolve life events
Offer a curated set of situations selected from the character's current context. An event may be:
- A new opportunity (scholarship, job lead, friendship, side project).
- A responsibility or commitment (family need, school requirement, household expense).
- A setback (illness, job loss, conflict, unexpected cost).
- A relationship moment (support, disagreement, milestone).
- A positive surprise or ordinary life moment.

Each event must have a reason to appear and options that lead to meaningfully different outcomes. Events can be authored story beats, system-generated situations, or a combination. The event system should create a coherent personal story rather than a random headline feed.

Not every week needs a dramatic event. Quiet weeks are valid. Avoid notification spam and repeated event templates.

### Phase D — Review and confirm the week
Before advancing, show a concise weekly review:
- Current date/week and age.
- Selected weekly activities and automatic education/work responsibilities that will resolve.
- Planned activity costs and available cash where relevant.
- Unresolved situations, an over-budget or stale activity plan, or known constraints.

The player explicitly chooses to advance one week. The weekly resolver validates the complete plan, resolves accepted actions and due effects in deterministic order, applies costs exactly once, clears resolved actions, advances the calendar by seven days, and returns a concise recap. Month/year boundary settlement remains separate and must run exactly once.

### Phase E — Show what changed
After weekly resolution, provide a compact weekly recap:
- The most important outcomes, not every internal calculation.
- Financial changes with understandable sources.
- Education/work/relationship/health milestones that actually occurred.
- New opportunities, obligations, flags, or follow-up events.
- Links to the owning domain for deeper details.

Keep the Overview activity feed as the complete chronological record of everyday actions and ordinary events. Reserve Life History for major achievements and life-stage milestones; do not duplicate routine activities there. The recap should make the causal link between prior choices and results visible.

### Weekly review gate (implemented)

Before advancing, the player can open a weekly review showing the current date, planned activity count, age, year, and available cash. It explains that selected activities resolve in the weekly simulation and that annual financial settlements remain separate. A pending event is shown as unresolved; it normally remains available until its year-boundary expiry unless a choice is scheduled. The player must explicitly confirm the week; returning to the current week leaves the save unchanged.

The weekly preview is intentionally partial. It does not claim to predict tax, recurring payments, loans, interest, property, investment, or market settlement. Those systems still resolve in the simulation and are identified as exclusions in the UI. The review is a decision aid, not a second financial ledger.

## 4. Event and consequence system

An event is a gameplay object, not just a paragraph with buttons.

Each event definition should support:
- Stable event ID and content version.
- Eligibility and trigger rules: age/life stage, country/location, finances, health, education, employment, household, relationships, prior choices, cooldowns, and required/blocked flags.
- Trigger type: scheduled life-stage milestone, system threshold, follow-up, or weighted contextual opportunity.
- Priority and frequency controls so urgent or important events can displace low-value content.
- Short narrative context explaining why this situation is happening now.
- Two or more genuinely distinct choices where appropriate; some situations may have one clear response or no player choice.
- Costs and requirements shown before selection.
- Immediate state changes and delayed effects.
- Flags, obligations, relationships, opportunities, or future event links.
- A history record describing the choice and the result.

Event selection must be plausible and fair:
- Check eligibility in the simulation, not only the UI.
- Prefer relevance over raw randomness. Randomness chooses among plausible events; it must not make an impossible event happen.
- Use weights, cooldowns, uniqueness rules, and per-category limits to prevent repetition.
- Do not present the same event repeatedly after the player has resolved it unless it is intentionally repeatable.
- Do not make every event a crisis. Include ordinary, positive, humorous, bittersweet, and difficult experiences.
- Keep outcomes uncertain where appropriate, but show the player the known costs, likely benefits, and material risks.
- Avoid dominant choices. Different options should suit different priorities, resources, personalities, and risk tolerances.
- Store enough state to preserve delayed consequences across save/load and future years.

### Meaningful-choice acceptance test

A choice is meaningful only when:
1. The player can see the situation and understand the available options before choosing.
2. Each option communicates its known cost, requirement, and likely direction of outcome.
3. The selected option changes game state, future possibilities, or the personal story in a material way.
4. The game later reminds the player of important consequences through outcomes, changed relationships, history, or follow-up events.
5. The choice is persistent for the current playthrough; do not offer an undo/time-machine mechanic unless separately approved.

Avoid fake choices where all options produce the same result with different wording.

## 5. Connected life systems

Keep domain workspaces separate in the UI, but connect their simulation effects.

| System | What it should influence |
|---|---|
| Health and wellbeing | Physical and mental condition, stamina, stress, workload, recovery, professional support, medical costs and later-life care |
| Education | Qualifications, opportunities, career access, income potential, school relationships and milestones |
| Work and career | Income, stability, time, stress, skills, colleagues/relationships, retirement and pension eligibility |
| Family and relationships | Emotional support, obligations, household choices, major events, dependants, inheritance/legacy |
| Finance | Choices affordable now, resilience to shocks, debt pressure, housing, lifestyle, long-term security |
| Lifestyle and home | Recurring commitments, comfort, access to services, household needs, spending trade-offs |
| Traits/personality | Small contextual modifiers and event options; never deterministic labels or fixed destiny |

Cross-domain effects must be explicit and auditable. For example, payroll credits a bank account through the shared ledger; a health issue may create a Life event and a medical expense; a family change may alter household costs. These effects must not merge domain screens or create duplicate sources of truth.

## 6. Stats must affect play

Health, happiness, intelligence, fitness, stamina and stress are not decorative bars. Each needs a defined, tested role:
- **Health:** influences vulnerability, recovery, physical limitations, medical events, and later-life risk. Zero health is a critical state, not a meaningless number.
- **Happiness:** influences wellbeing and selected social/decision outcomes; low happiness should create contextual pressure and possible support opportunities, not randomly punish every action.
- **Intelligence:** influences learning outcomes and eligibility/odds for relevant education and career paths, without guaranteeing success.
- **Stamina:** falls under sustained workload and recovers through rest and lighter weeks; low stamina reduces study efficiency.
- **Stress:** rises under excessive commitments, falls through recovery/support and reduces study/work efficiency; sustained high pressure can produce burnout or anxiety conditions.
- **Fitness:** influences physical activities, resilience, and age-related capability where appropriate.

Use bounded values, gradual change, multiple ways to recover, and meaningful trade-offs. Avoid a single optimal routine that maximizes every stat with no downside. Do not introduce hidden stat penalties that the player cannot understand.

## 7. Life stages, family, retirement, and ending

Life stages should change available content and responsibilities, not just the label beside age.

- Childhood: family context, early learning, play, support, and formative events. Children do not manage adult financial products or adult work.
- Teen years: school progression, interests, friendships, identity, limited earning, and preparation for adulthood.
- Young adulthood: higher education/training, first jobs, independent choices, relationships, and living arrangements.
- Adulthood: career growth, partnership/family possibilities, household and financial commitments, personal goals, and setbacks.
- Midlife: career/family transitions, health maintenance, long-term financial planning, caregiving, and changing priorities.
- Later life: retirement choices, pension/other income, health and care needs, family relationships, flexible work if desired, and legacy preparation.

Family and relationships must become persistent modeled entities only when a complete useful loop is ready: people have identities/roles, relationship state, interactions, meaningful events, and consequences. Do not add a superficial relationship score without people or decisions.

Retirement must be a player-relevant transition, not an automatic job deletion at a fixed age. Support continuing work, changing work, or retiring when eligible. Pension income and retirement expenses must be modeled and tested before presenting retirement as financially supported.

Death is the terminal state of a life. Build a fair, explainable mortality model from age, health, and relevant risks; do not let age or a single stat produce arbitrary instant death. Health at zero must trigger a meaningful critical state and a tested resolution path. Once death is resolved:
- Stop normal time advancement and all living-character actions.
- Preserve the final save and history as a completed life.
- Present a final life summary with milestones, relationships, education/career, financial outcome, major decisions, and cause/context of death when appropriate.
- Resolve estate, inheritance, dependants, and legacy only to the extent those systems are implemented; never invent recipients or assets.
- Allow a new life or a future generational mode without overwriting the completed life.

No character may continue aging indefinitely after a terminal death state. Do not claim a complete birth-to-death game until the full terminal flow is implemented and tested.

## 8. Replayability and balancing

Replayability should come from interacting systems and different viable lives, not merely a large random-event count.
- Starting stage, background, traits, opportunities, and player choices create variation.
- Events should have multiple paths and follow-ups, including quiet/ordinary outcomes.
- No single stat-maxing or money-maxing strategy should dominate all lives.
- Include viable low-income, family-focused, education-focused, career-focused, entrepreneurial, and unconventional paths as systems mature.
- Use difficulty/balance tests across different countries/currency scales and starting ages.
- Test edge cases: no income, high wealth, debt, unemployment, low health, low happiness, no family support, old age, and very long saves.
- Make economic and mortality randomness reproducible from save state/seed so bugs can be reported and replayed.

## 9. Scope and implementation sequence

Build one complete playable slice at a time:
Completed foundation: date-based weekly calendar, strict current-schema persistence, automatic background responsibilities, stamina-based personal activities, and deterministic weekly resolution.

Next implementation stages:
1. Move financial systems to explicit monthly/annual cadences without duplicate or lost settlements.
4. Adapt events, deadlines, recaps, and bulk advancement to weekly time.
5. Deepen School and Work into recognizable domain-native progression systems.
6. Add persistent family/relationship loops, then meaningful health and aging consequences.
7. Build sustainable retirement/later-life finances, terminal death, final-life summary, and only then inheritance/legacy.
8. Balance and replay-test complete lives across starting stages and country profiles.

Do not build every life system in one milestone. Each stage must have a playable acceptance test and must preserve existing save slots and financial records.

## 10. Reference reading

These are design references, not specifications to copy:
- BitLife official site: https://bitlifeapp.com/
- BitLife Google Play listing: https://play.google.com/store/apps/details?id=com.candywriter.bitlife
- The Sims 4 decision-making and needs analysis (independent reverse-engineering study): https://lifesim.com/research/how-the-sims-4-works
- Meaningful choice in games: https://www.gamedeveloper.com/design/meaningful-choice-in-games-practical-guide-case-studies
- Periodic dilemma generators and replayability: https://www.gamedeveloper.com/design/replayable-games---game-mechanics-as-periodic-dilemma-generators-pdg-
- Interactive narrative and emergent/authored storytelling: https://doi.org/10.1016/j.entcom.2022.100500

Use these references to understand patterns. Never copy their text, event scripts, art, branding, UI, or proprietary content.


## Personal Technology as a connected life system

Smartphones, laptops, and desktop PCs are modeled in the separate [Personal Technology system specification](PERSONAL_TECHNOLOGY.md). The system lives in Life → Personal Technology; shopping is provided through Lifestyle → Discover; payments use the existing Finance transaction path.

Devices are durable, individual assets with age-appropriate ownership/access, a small capability model, gradual condition changes, and repair/replacement decisions. They can enable or improve selected school, work, communication, learning, and entertainment opportunities. They must not become mandatory paywalls: shared, school/work-provided, public, or non-digital alternatives should exist where appropriate.

Do not duplicate device inventory or management controls in other workspaces. Cross-domain systems check actual device capability/access and record effects through their own domain state.

## Family simulation

Family is a persistent simulation domain, specified in [FAMILY_SYSTEM.md](FAMILY_SYSTEM.md). It models identifiable people and a validated relationship graph, not a generic relationship meter. Kinship and guardianship links are distinct from household membership and dependency; closeness, trust, and tension are separate relationship dimensions.

The initial implemented slice generates a modest family-of-origin context for new characters, supports one- or two-parent backgrounds and a small sibling group, records historical family loss only when it predates the current life chapter, and provides targeted time/contact/reconciliation interactions. Adult financial support is an explicit cash outflow recorded in Finance. Existing saves without family state are initialized only through a deliberate player action.

Do not assume every character has a partner or children. Partnership, parenthood, adoption, separation, caregiving, bereavement, inheritance, and generational play remain future mechanics until their full simulation loops exist. No relationship screen may claim a feature that is not represented in save data. Family interactions, event choices, business management, and personal activities now reserve weekly time and resolve through the same weekly turn.



## Weekly action plan and stamina allocation

The player-facing Schedule system is retired. Do not reintroduce a Schedule tab, seven-day grid, day/period picker, recurring commitments, or time-slot allocation for school, work, or personal actions. Education attendance and employment are automatic background responsibilities that progress during weekly resolution and contribute to workload/stress without assigning weekdays or periods.

The weekly plan contains optional contextual actions toggled in their owning workspaces. Stamina is a shared budget: the player must include sufficient recovery before selecting actions whose costs exceed current stamina. Selection validates the combined planned recovery and action costs; weekly fatigue/recovery is applied separately. The Advance review blocks any invalid plan and never shows negative stamina.

Schema 6 persists only the current action-plan shape. No old-save migrations or timetable compatibility adapters are maintained. Unsupported older saves remain untouched until the player explicitly confirms a reset. New enrollment and employment changes never create calendar reservations.

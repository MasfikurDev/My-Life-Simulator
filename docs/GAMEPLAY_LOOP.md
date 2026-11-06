# Gameplay Loop Redesign

**Canonical game-design implementation plan · Weekly-cycle direction · 2026-11-07**

This document turns the gameplay audit into a staged, implementation-ready direction. It distinguishes the implemented first slice from planned mechanics.

## Current implementation status · 2026-11-07
The first event-driven slice and the annual-action-to-weekly-turn transition are implemented in the web simulation:
- Contextual events are selected using character/year context and age/health eligibility.
- Pending events and choices persist in the character save; the simulation validates choice requirements and costs.
- Personal activities, family interactions, business management, and time-consuming event choices reserve dated weekly time blocks and resolve in deterministic order.
- Weekly resolution applies effects and costs, records Life History, clears successful reservations, and advances the calendar by seven days. A stale reservation blocks the turn and remains available for repair instead of being silently discarded.
- Age and life-stage eligibility change on the character's birthday. Annual financial settlement and annual event expiry remain at the year boundary.
- The save migration preserves existing slots and stores the original pre-migration payload as a recovery copy.

Still planned: a full year-opening and planning phase, year-end financial preview, richer event selection/cooldowns/content, broader cross-domain consequences, and the later School/Work/Family/Health/Retirement/Death milestones. This is the first playable slice, not completion of the full redesign.

## 1. The game we are making

My Life Simulator is a replayable, week-by-week life simulation game, with monthly financial rhythms and yearly life-stage progression. The player guides one character from a chosen starting stage through a changing life, makes decisions under limited time and resources, experiences authored and emergent situations, and eventually reaches a meaningful ending.

The experience must feel like playing a game:
- Give the player a clear reason to make decisions each year.
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

**Decision: the week is the fundamental playable time unit.** Months organize recurring finances and reports; years organize birthdays, life-stage transitions, annual milestones, and long-term reviews. The old three-actions-per-year budget is retired as a design direction. Do not merely change it to three actions per week: the new loop is based on a calendar, recurring commitments, and available free time.

The player should feel that a life is unfolding, not that they are spending abstract action tokens. A normal week should take a few deliberate choices and resolve quickly. Quiet weeks are allowed; important weeks can contain more decisions.

### 3.1 Time model and calendar

- Use a continuous, deterministic game calendar with an explicit current date and week boundary. A week runs Monday through Sunday; the calendar must handle month/year boundaries and leap years correctly.
- Keep the displayed age derived from date of birth and current date. Age changes on the character's birthday, not every week or at every month boundary.
- The current calendar year remains the world year. Advancing one week must never accidentally age the character by one year.
- The player advances exactly one week at a time through an explicit **Start next week** action. No screen visit, save/load, or background process advances time.
- Provide a compact calendar/week view, not a real-time clock or hour-by-hour simulation.
- Do not simulate 168 individual hours, every NPC, travel minute, or every day autonomously. The game uses meaningful time blocks and summarized routines.

### 3.1.1 Calendar foundation (implemented first slice)

- The simulation uses strict ISO date-only strings (YYYY-MM-DD), interpreted in UTC for deterministic arithmetic. There are no local-time or daylight-saving transitions in the game calendar.
- Weeks run Monday through Sunday. The calendar exposes the Monday week start even when a date falls later in that week; advancing a week moves the date forward by exactly seven days.
- New characters receive an initial calendar anchored to the first Monday on or after January 1 of their starting game year. Their birth date is placed on the same month/day in the year implied by their chosen starting age, preserving that age at creation.
- Age is calculated from birth date and current date, not from the number of week advances. A birthday changes age only when the current date reaches the birthday.
- For a February 29 birth date in a non-leap year, the game observes the birthday on March 1. This is a consistent game-calendar convention, not a legal-age rule.
- Existing saves are migrated to the weekly model without discarding character or slot data. Saves without calendar data are anchored to the first Monday on or after January 1 of their stored year; the original payload is retained under a separate recovery key.
- Calendar helpers, weekly advancement, schedule consumption, and birthday-based aging are implemented and tested. Monthly settlement, date-based event deadlines, and recurring payment cadence remain future work.

### 3.2 Weekly schedule: commitments first, free time second

The week is shaped by recurring commitments and the player's discretionary choices.

- School, employment, household responsibilities, and other implemented commitments may reserve recurring day/period blocks. These schedules belong to their own domain workspaces.
- The player sees the commitments that matter this week and the free-time capacity they leave.
- Player-directed activities consume one or more free-time blocks, plus money and/or energy when appropriate. Different activities can take different amounts of time.
- A time block is a scheduling constraint, not an action token. The same activity cannot be scheduled into overlapping time; unavailable time cannot be spent twice.
- Do not require the player to fill every day or every block. Rest, unplanned time, and quiet weeks are valid.
- Do not add an energy stat merely to create another meter. If energy is introduced, define its source, recovery, bounds, effects, UI explanation, and tests before using it as a cost. Until then, existing health/fitness/happiness rules remain authoritative.
- Some activities are immediate choices; others become recurring routines or commitments. A routine must show its duration, schedule, cost, benefit, and cancellation/change rules.
- Events may interrupt or offer alternatives to a schedule. The player should understand which commitment is affected and what the trade-off is.

**No arbitrary universal activity quota:** available free time is derived from the character's actual modeled commitments and schedule. Where a domain has not yet implemented a schedule, it must not invent one or pretend the character attends school/works set hours. Use a clearly labeled provisional free-time allowance only for that domain until its schedule exists, and keep that allowance consistent and testable.

### 3.2.1 Schedule model foundation (implemented first slice)

The simulation now has a reusable, save-compatible weekly schedule model:
- A week is represented as seven days with three broad periods: morning, afternoon, and evening. These are planning blocks, not hourly simulation.
- Recurring commitments reserve one or more consecutive periods on a selected weekday. They are only added when a domain has a real modeled commitment; the schedule engine does not invent school or work hours.
- Planned activities reserve dated periods in the selected week and must remain within that week.
- The pure schedule resolver expands commitments, identifies free periods, and reports duplicate IDs, invalid dates/durations, out-of-week activities, and overlapping placements.
- New characters receive an empty versioned schedule. Legacy saves are migrated without discarding character or slot data; saves that lack calendar data are anchored to the first Monday on or after January 1 of their stored year, and the obsolete annual action counter is removed.
- The Life workspace now exposes a seven-day planner. Players can reserve age-available activities in morning/afternoon/evening periods, see the duration each activity reserves, remove plans, and receive a conflict message when a placement overlaps an existing reservation. The schedule is saved with the character.
- Activity time requirements now come from one shared simulation catalogue: study and extra work take two consecutive periods; exercise, socializing, job applications, and career development take one.
- The simulation exposes validated planning operations for personal activities, family interactions, business management, and time-consuming event choices. They enforce eligibility, current-week dates, duration fit, no overlap with commitments or other activities, and enough cash for combined planned costs.
- The planner shows each activity's duration and estimated cost, plus the cash remaining after all planned costs. Removing an activity releases its time and planned budget.
- Planned activities, family interactions, business sessions, and time-consuming event choices resolve through the weekly loop. Costs and effects are applied at resolution, reservations are cleared, and the calendar advances by seven days. If a reservation becomes invalid after planning, the turn is rejected and the plan is preserved for repair instead of being silently discarded. Annual income, household expenses, taxes, asset settlement, and financial products still settle at the year boundary; age and birthday-triggered life-stage eligibility update on the actual birthday.

### 3.3 The week in play

**Phase A — Open the week**

Show a compact "This week" view:
- Date range, current age, and relevant life stage.
- Scheduled school/work/household commitments that are actually represented in save data.
- Available free-time blocks and any commitments due soon.
- Current money position and near-term payments only when the values are modeled.
- Pending events, opportunities, deadlines, and important consequences.
- At most a few relevant prompts; do not duplicate whole domain dashboards.

**Phase B — Make choices in their own workspaces**

The player visits the relevant domain and chooses what to do:
- **School:** attend scheduled classes, study, complete assignments, prepare for exams, and respond to school situations when those mechanics exist.
- **Work:** attend shifts, perform work activities, develop skills, pursue opportunities, and respond to workplace situations when implemented.
- **Life:** wellbeing, personal growth, relationships, family, recreation, and personal commitments.
- **Finance:** banking, spending, saving, debt, assets, household planning, and business decisions.
- **Lifestyle:** services, purchases, and home arrangements.

Every activity must state its time requirement, monetary cost/income, prerequisites, and meaningful effects before confirmation. Only charge resources after the simulation validates and accepts the activity. Activities that fail validation must leave the save unchanged.

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
- Existing annual financial mechanics must be migrated deliberately. Do not simply divide annual values by 12 without considering rounding, due dates, interest, inflation, and save compatibility.

**Yearly layer**
- Birthday and age progression occur on the actual birthday.
- Resolve school-year transitions, annual salary review, taxes, annual interest, market updates, insurance/contract renewals, and other annual mechanics only at their defined annual dates.
- Present an annual life review that highlights milestones and longer-term trends; do not make the player perform 52 weekly recaps manually.
- Life-stage eligibility changes at the relevant birthday/date boundary and is enforced in simulation functions as well as UI.
- Annual financial settlement must not repeat an obligation already processed monthly.

### 3.5 Deterministic week resolution

The exact order is a domain contract and must be tested. Proposed order:
1. Validate the week can advance and capture the current week's planned activities/commitments.
2. Resolve scheduled attendance/work participation and player activities; reject invalid or overlapping time allocations.
3. Resolve deadlines and events due during the week, recording choices and consequences.
4. Apply weekly recurring income/expenses only when their due dates fall in this week.
5. Update bounded wellbeing/skill/progression effects from what actually happened.
6. Resolve scheduled follow-ups due this week.
7. Move the calendar to the next week and detect month/year/birthday boundaries.
8. At a month boundary, process monthly settlement exactly once.
9. At a year boundary, process annual settlement and the annual review exactly once. Age and birthday-triggered life-stage transitions are processed on the actual birthday, including when it falls mid-year.
10. Prepare the next week's schedule, commitments, and eligible event opportunities.
11. Return structured effects, ledger entries, history entries, and recap data.

The final order may be adjusted to satisfy domain dependencies, but it must remain deterministic, idempotent against duplicate UI calls, and covered by boundary tests. Financial transfers, income, bills, interest, and expenses must never be applied twice if the player retries, reloads, or resumes a save.

### 3.6 Pacing and player control

- A normal week should be playable in a short mobile session: review, make a small number of meaningful choices, resolve, and continue.
- Add **Skip quiet week / advance several weeks** only after single-week resolution is reliable. It must stop before birthdays, deadlines, important events, payment failures, job/school milestones, or other decision points.
- Bulk advancement must resolve every intervening week in order; it must not skip simulation or collapse several weeks into one approximate calculation.
- Offer clear pause points and a way to inspect the calendar/history without advancing time.
- Do not punish players for taking a break or for not opening the game in real time. All time is simulated only by explicit player commands.
- Avoid mandatory repetitive attendance clicks. Once recurring schedules exist, routine participation may resolve automatically, while absences, performance choices, conflicts, and important situations require player agency.
- Do not make every week a checklist. The player should be able to make no discretionary choice in a quiet week and continue without penalty beyond the consequences of modeled commitments.

### 3.7 Weekly loop acceptance tests

A playable weekly loop is not complete until:
1. A new player can understand the current week, commitments, free time, and next action without reading documentation.
2. The player can schedule at least two different activities with different time costs and see that they cannot overlap.
3. School/work commitments reserve time only when actual schedule data exists.
4. A weekly activity can create a meaningful immediate effect and a persistent delayed consequence.
5. One week advances exactly once; retry/reload cannot duplicate income, bills, effects, or history.
6. Crossing month-end processes monthly payments once; crossing year-end processes annual systems once.
7. A birthday changes age and eligibility on the correct date, not simply every 52 button presses.
8. Old saves load with a documented migration and no lost cash, accounts, debt, investments, history, or pending events.
9. A quiet week can be advanced quickly without fake chores or forced dramatic events.
10. Multi-week scenario tests produce coherent results for a child in school, an employed adult, an unemployed adult, and a later-life character.

### Legacy transition: annual actions to weekly schedule

The annual-action-to-weekly-save migration is implemented:
- Schema 1 single-save data and schema 2 multi-slot data migrate to schema 3 while preserving valid character records and all three slot identities.
- Existing age and world year remain authoritative. When no calendar exists, the migration anchors the character to the first Monday on or after January 1 of the stored year and derives a matching birth date so the displayed age is unchanged at migration.
- The obsolete annual action counter is retired; unused annual actions are not converted into extra weekly time or free activities.
- The exact pre-migration payload is retained under `my-life-simulator.save.pre-weekly-migration` before the new payload replaces the active save. Unknown formats are rejected without overwriting the original.

### Current implementation boundary

The app has a weekly calendar, validated activity reservations, and a reproducible, exactly-once weekly resolver. Age and birthday-triggered life-stage transitions follow the character's actual birth date. Monthly settlement and date-based recurring payment schedules remain future work; annual income, expenses, taxes, asset settlement, and annual reviews still run at the year boundary.

## 4. Event and consequence system

A simulated week is the basic playable turn; a month is a financial/reporting interval; a year is a life-progression chapter.

### Phase A — Review the current life chapter
The annual overview remains a life-chapter summary, not the playable turn. Present a compact review containing:
- Current age, life stage, year, and the most relevant changes since last year.
- Current circumstances that affect decisions: school/education, work, household, money, health, and important relationships when implemented.
- New opportunities, unresolved situations, upcoming commitments, and warnings.
- A small number of relevant goals or pressures. Do not dump every system's data onto one screen.

### Phase B — Make life decisions
The player chooses from age- and circumstance-appropriate actions in the relevant domain workspaces:
- School: study and, when implemented, enrollment, classes, attendance, exams, and education choices.
- Work: job search, applications, career development, workplace choices, and later retirement decisions.
- Life: wellbeing, personal growth, relationships, family, recreation, and personal commitments.
- Finance: banking, spending, saving, debt, assets, household planning, and business decisions.
- Lifestyle: services, purchases, and home arrangements.

Actions have explicit costs and trade-offs: reserved time blocks, money, energy, risk, or an opportunity cost. Explain important costs before confirmation. Do not add an arbitrary universal weekly action quota or extra meters merely to make the loop feel busy.

The player may leave free time unused and advance deliberately. Do not silently auto-spend reservations or auto-advance time. Quiet weeks must remain quick to resolve.

### Phase C — Resolve life events
Offer a curated set of situations selected from the character's current context. An event may be:
- A new opportunity (scholarship, job lead, friendship, side project).
- A responsibility or commitment (family need, school requirement, household expense).
- A setback (illness, job loss, conflict, unexpected cost).
- A relationship moment (support, disagreement, milestone).
- A positive surprise or ordinary life moment.

Each event must have a reason to appear and options that lead to meaningfully different outcomes. Events can be authored story beats, system-generated situations, or a combination. The event system should create a coherent personal story rather than a random headline feed.

Not every year needs a dramatic event. Quiet years are valid. Avoid notification spam and repeated event templates.

### Phase D — Review and confirm the year
Before advancing, show a concise review:
- Decisions made and unresolved choices.
- Expected annual income and recurring commitments where known.
- Important risks or shortfalls the player can reasonably anticipate.
- The year-end effects that are predictable, with uncertain outcomes clearly marked.

The player explicitly chooses to advance. The year-end simulation then resolves in a documented, deterministic order: income and financial settlements, recurring commitments, school/work progression, household/family changes, health and relationship drift, event follow-ups, aging, and next-year setup. The exact order must be defined in the simulation design and covered by tests.

### Phase E — Show what changed
After advancement, provide a compact year recap:
- The most important outcomes, not every internal calculation.
- Financial changes with understandable sources.
- Education/work/relationship/health milestones that actually occurred.
- New opportunities, obligations, flags, or follow-up events.
- Links to the owning domain for deeper details.

Write important outcomes to chronological life history. The recap should make the causal link between prior choices and results visible.

### Year review gate (implemented first slice)

Before advancing, the player can open a review showing the current year, next age, unused actions, employment income, estimated living costs, and the cash remaining after those two predictable items. An unresolved event is called out because it will expire when the player advances. The player must explicitly confirm advancement; returning to the year leaves the save unchanged.

The preview is intentionally partial. It does not claim to predict tax, recurring payments, loans, interest, property, investment, or market settlement. Those systems still resolve in the simulation and are identified as exclusions in the UI. The review is a decision aid, not a second financial ledger.

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
| Health and wellbeing | Available actions, energy/capacity, medical costs when implemented, work/study participation, later-life independence |
| Education | Qualifications, opportunities, career access, income potential, school relationships and milestones |
| Work and career | Income, stability, time, stress, skills, colleagues/relationships, retirement and pension eligibility |
| Family and relationships | Emotional support, obligations, household choices, major events, dependants, inheritance/legacy |
| Finance | Choices affordable now, resilience to shocks, debt pressure, housing, lifestyle, long-term security |
| Lifestyle and home | Recurring commitments, comfort, access to services, household needs, spending trade-offs |
| Traits/personality | Small contextual modifiers and event options; never deterministic labels or fixed destiny |

Cross-domain effects must be explicit and auditable. For example, payroll credits a bank account through the shared ledger; a health issue may create a Life event and a medical expense; a family change may alter household costs. These effects must not merge domain screens or create duplicate sources of truth.

## 6. Stats must affect play

Health, happiness, intelligence, and fitness are not decorative bars. Each needs a defined, tested role:
- **Health:** influences vulnerability, recovery, physical limitations, medical events, and later-life risk. Zero health is a critical state, not a meaningless number.
- **Happiness:** influences wellbeing and selected social/decision outcomes; low happiness should create contextual pressure and possible support opportunities, not randomly punish every action.
- **Intelligence:** influences learning outcomes and eligibility/odds for relevant education and career paths, without guaranteeing success.
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
Completed foundation: date-based weekly calendar, backward-compatible save migration, weekly schedule/free-time model, and deterministic weekly resolution.

Next implementation stages:
1. Move financial systems to explicit monthly/annual cadences without duplicate or lost settlements.
4. Adapt events, deadlines, recaps, and bulk advancement to weekly time.
5. Deepen School and Work into recognizable schedule-driven systems.
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


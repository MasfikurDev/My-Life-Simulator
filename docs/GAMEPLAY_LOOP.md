# Gameplay Loop Redesign

**Canonical game-design implementation plan · Approved direction · 2026-11-06**

This document turns the gameplay audit into a staged, implementation-ready direction. It distinguishes the implemented first slice from planned mechanics.

## Current implementation status · 2026-11-06
The first event-driven gameplay slice is implemented in the web simulation:
- Three original contextual events are selected using character/year context and age/health eligibility.
- A pending event and its choices are persisted in the character save; choice costs and requirements are validated by the simulation.
- Choices can consume annual actions and money, change bounded stats, and schedule a delayed next-year consequence.
- Resolved choices and consequences are written to Life History. Unanswered situations expire with an explicit history entry when the player advances.
- Home shows the current event and a concise recap derived from recorded year changes.

Still planned: a full year-opening and planning phase, year-end financial preview, richer event selection/cooldowns/content, broader cross-domain consequences, and the later School/Work/Family/Health/Retirement/Death milestones. This is the first playable slice, not completion of the full redesign.

## 1. The game we are making

My Life Simulator is a replayable, year-by-year life simulation game. The player guides one character from a chosen starting stage through a changing life, makes decisions under limited time and resources, experiences authored and emergent situations, and eventually reaches a meaningful ending.

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

## 3. The annual gameplay loop

A simulated year is a playable chapter, not a button that simply increments age.

### Phase A — Open the year
Present a compact "This year" view containing:
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

Actions have explicit costs and trade-offs: limited annual action capacity, money, time, energy, risk, or an opportunity cost. Explain important costs before confirmation. Keep the current limited annual action budget as the starting rule, but tune it only through playtesting; do not add extra meters merely to make the loop feel busy.

The player may leave actions unused and advance deliberately. Do not silently auto-spend actions or auto-advance time. If unused actions matter, explain the opportunity cost without trapping the player in a dead end.

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
1. Rework annual progression into the phases above and add a small, high-quality contextual event set with real consequences.
2. Make event follow-ups and cross-domain consequences persist and appear in year recaps/history.
3. Deepen School and Work into recognizable game systems with actual progression and choices.
4. Add persistent family and relationship loops.
5. Give health and aging consequences; build retirement and sustainable later-life finances.
6. Add mortality, terminal death, final-life summary, and only then inheritance/legacy.
7. Balance and replay-test complete lives across starting stages and country profiles.

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

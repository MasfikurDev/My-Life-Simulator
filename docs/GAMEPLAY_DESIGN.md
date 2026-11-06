# Gameplay Design

**Canonical gameplay direction · Updated 2026-11-06**

## Core loop
1. Review the character's life and circumstances.
2. Choose an activity, interaction, or response to an event.
3. Pay its cost (time, money, energy, or opportunity).
4. Apply immediate effects and schedule delayed consequences.
5. Review the updated life and history.
6. Advance time deliberately when ready.

## Character creation and starting lives
Character creation is scenario-led, not a free-form stat editor. The player chooses one of seven curated starting stages: birth (0), childhood (6), teen years (13), young adulthood (18), established adulthood (30), midlife (45), or later life (65). No arbitrary age slider or manual stat allocation.

The game generates a complete character in one coherent pass. The generated profile includes name, gender identity, nationality, country, birthplace, primary language, currency, family economic background, age-appropriate education status, health, happiness, intelligence, fitness, and two personality traits.

### Random generation rules
- Generate nationality/country first; birthplace, primary language, culturally appropriate name pools, local name order and currency must come from that same country profile.
- Generate gender identity using an explicit gameplay weighting (currently 49.5% male, 49.5% female, 1% non-binary), then choose a culturally plausible name pool for that identity and nationality. This is a game distribution, not a demographic claim. Non-binary characters use curated neutral-name pools.
- Gender and nationality must not be used as proxies for intelligence, health, happiness, fitness, personality, morality or ambition.
- Personality traits and ability stats are generated independently of gender and nationality.
- Age determines education status and starting financial eligibility. Children do not receive adult personal income; paid work remains unavailable before 16.
- Family economic background can affect starting money, but does not predetermine ability or future outcomes.
- Reroll regenerates the entire character. No isolated stat rerolls or manual stat editing in the creation flow.
- The player may choose a life stage and reroll the generated person. Name, identity, birthplace and stats are not individually edited in the creation screen.
- Country and name datasets are curated starter coverage, not a claim to represent every nationality or naming tradition. Expand with reviewed country packs.
- Random generation accepts an injectable random source in tests so consistency and bounds are reproducible.

Current country packs: Bangladesh, India, United States, United Kingdom, Canada, Australia, Japan, Nigeria, Brazil and Germany. Countries are currently selected evenly for gameplay variety, not by global population share. Currency is stored with the character and all money UI must format using that currency.

## Current implementation boundaries
Selectable stages and generated identity do not imply complete life-stage simulation. Childhood, education pathways, retirement, family relationships and local economic systems still need gameplay implementation. Starting financial values are a lightweight foundation, not a realistic national economic model.

## Age-specific progression and eligibility
Every system, activity, event, responsibility, and financial mechanic must declare an age eligibility range and any additional prerequisites. Age is a progression boundary, not merely a label on the dashboard. Ineligible actions are removed from the available-action list and rejected again by the simulation layer; the UI is never the only gate.

Current life-stage bands are 0–2 early childhood, 3–5 preschool, 6–12 childhood, 13–15 early teens, 16–17 later teens, 18–24 young adulthood, 25–44 adulthood, 45–64 midlife, and 65+ later life. These are game-design bands, not claims that every person follows the same life path.

Current action eligibility: learning/study becomes available at age 3; one-off earning and part-time job applications become available at age 16; full-time employment and higher education become available at age 18; flexible employment is available as a new option from age 65. Existing jobs do not automatically end at 65. Career development is available only while employed. Adult job applications remain available for job changes. Exercise/play and social/family time remain age-adapted across stages.

### Education progression
- Education status follows the age bands: not started (0–2), early learning (3–5), primary education (6–12), secondary education (13–17), and secondary education completed at 18.
- Study consumes an annual action, improves intelligence, and advances learning progress. Progress resets at the next school-stage boundary.
- From age 18, five study actions (20 progress each) can complete the higher-education qualification. Higher education improves access to professional roles and application odds.
- Education is a game progression model, not a detailed curriculum, school attendance simulation, or real qualification equivalency.

### Employment and recurring finances
- At ages 16–17, a successful application creates a part-time assistant role. Adult full-time employment is not available before age 18.
- From age 18, a successful application creates an operations role; higher education unlocks a higher-paid professional role. At 65+, new applications offer flexible work. Existing jobs can continue.
- Application outcomes use education, intelligence, and selected personality traits. Randomness is injectable for deterministic tests.
- Career development consumes an action and raises job performance. After at least two years of experience, performance of 85 or more can trigger a promotion, increasing salary by 20%. Promotions are capped at three in this first implementation.
- Paid activities must be affordable before they can be selected or applied. The simulation is authoritative: an unaffordable action changes neither money nor stats and does not consume an action. Costs use the character's currency scale.
- Salary is credited when the player advances a year. Before age 18, the existing simplified employment expense rates remain in place. From age 18, a selectable family-supported, shared, or independent living arrangement determines recurring housing, food, transport, utilities, and personal costs. The annual budget is calculated from job pay, or a provisional baseline when unemployed.
- Household costs are paid from income and available cash. If funds cannot cover the estimate, the unpaid amount is recorded as a shortfall and happiness decreases; balances never become negative and no debt is silently created. This is a game-pressure mechanic, not a real-world cost model.
- Players can set an emergency savings target of one, three, or six months of estimated household costs. Progress is measured against the current cash balance; savings are not a separate account or locked funds.
- One-off extra work remains a separate action. Taxes, unemployment benefits, debt, assets, and detailed country-aware cost models are not implemented.
- New household, savings-goal, and finance-history fields are optional on Character so existing local saves remain readable without a schema migration.

Build progression in connected layers: early development and schooling; teen education/interests and limited earning; adult employment and recurring finances from 18; career growth and household responsibilities as prerequisites and age permit; midlife health/financial planning; later-life retirement and flexible work. Unlock only mechanics that are implemented and eligible. Hide unavailable actions instead of showing dead controls. Explain an unlock only when it helps the player understand the next stage.

## Game log and debug export
The settings page provides a concise recent-log view backed by the character's chronological life history and a copyable, versioned JSON debug snapshot. The snapshot includes the active save slot, full character state, and complete history; it excludes device identifiers, browser details, and account data. Keep the export portable and deterministic apart from its explicit export timestamp. Do not include secrets or unrelated local settings.

## Candidate systems
Health; family; education; career; finance; relationships; lifestyle; contextual/scheduled/random/player-created events. Build incrementally and connect systems. Do not implement every system at once.

## Event model
A future event definition should include a stable ID/content version, eligibility conditions (age, location, finances, health, education, relationships, job, prior flags), trigger type, narrative, choices, costs, immediate effects, delayed consequences, and a history entry.
Randomness adds uncertainty but never overrides plausibility or eligibility. Avoid excessive repetition. Outcomes should be explainable from the character's circumstances.

## Simulation rules
- Actions consume a communicated resource, usually time, money, or energy.
- Attribute changes have sensible bounds.
- Attributes influence outcomes but do not dictate them.
- Use reproducible random seeds where practical.
- Financial changes balance against income, expenses, assets, and liabilities.
- Relationships evolve through interactions, compatibility, time, and events.
- Earlier choices can set flags, create obligations, unlock opportunities, or affect later events.
- Record meaningful changes chronologically.
- Time advances only through an explicit player action.
- Never silently discard a save.

## First playable slice
Scenario-led character creation with coherent randomized profiles, a modern dashboard, several meaningful activities, a limited number of actions per year, deliberate year advancement, contextual events, basic finances, persistent save, and life history.

## Later, not MVP blockers
Marriage/children, richer family trees, deeper education/career, property/assets, generational play, achievements, expanded event packs, cloud backup, online features. Prioritize based on demonstrated fun and player feedback.

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

The game generates a complete character in one coherent pass. The generated profile includes name, gender identity, nationality, country, birthplace, currency, family economic background, age-appropriate education status, health, happiness, intelligence, fitness, and two personality traits.

### Random generation rules
- Generate nationality/country first; birthplace, name pools and currency must come from that same country profile.
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

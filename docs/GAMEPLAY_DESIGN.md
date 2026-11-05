# Gameplay Design

**Canonical gameplay direction · Reviewed 2026-11-05**

## Core loop
1. Review the character's life and circumstances.
2. Choose an activity, interaction, or response to an event.
3. Pay its cost (time, money, energy, or opportunity).
4. Apply immediate effects and schedule delayed consequences.
5. Review the updated life and history.
6. Advance time deliberately when ready.

## Character creation and life stages
Players can begin a life at birth, childhood (6), teenage years (13 or 16), young adulthood (18 or 25), midlife (40), or later life (60). These are starting points into one continuous life simulation, not separate game modes. The chosen age is the character's actual starting age; time advances only through the explicit year action.

Character data may include identity, age/life stage, health, happiness, intelligence, fitness, personality traits, education, skills, occupation, income, savings, debt, assets, family, friends, partners, dependants, and chronological history. Age restrictions emerge naturally; impossible actions are not shown.

Current implementation supports the age choices, age-appropriate activity labels, and work eligibility from age 16. It does not yet simulate a complete childhood, education pathway, retirement, or age-specific family system. Do not imply those deeper systems are complete.

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
Character creation, a modern dashboard, several meaningful activities, a limited number of actions per year, deliberate year advancement, a few contextual events, basic stats/finances, persistent save, and life history. Keep the slice coherent rather than broad.

## Later, not MVP blockers
Marriage/children, richer family trees, deeper education/career, property/assets, generational play, achievements, expanded event packs, cloud backup, online features. Prioritize based on demonstrated fun and player feedback.

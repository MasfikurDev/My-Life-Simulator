# Family System

**Canonical system specification · Simulation-first · Foundation implemented · Reviewed 2026-11-09**

## Purpose

Family is a persistent life system, not a relationship score, decorative family tree, or UI-only contact list. It models the people who are part of a character's family, the ties between them, the quality and history of those ties, and the responsibilities and opportunities that follow.

The simulation owns family truth. UI components may display people, relationships, decisions, and history, but must never invent family members, relationship status, support, co-residence, or consequences.

## Design principles

1. **People before scores.** Every family relationship belongs to an identifiable person with a persistent identity and life timeline.
2. **A graph, not a fixed family template.** Support single-parent, two-parent, blended, adoptive, foster/guardian, extended, child-free, partnered, unpartnered, and chosen-family circumstances without treating one structure as the default ideal.
3. **Relationships are directional where necessary.** Parent/child and guardian/dependent roles have explicit direction; partnerships are mutual; sibling ties can be derived or recorded explicitly.
4. **Relationship quality is contextual.** Closeness, trust, and tension are separate bounded dimensions. A person can be close but in conflict, trusted but not emotionally close, or distant without hostility.
5. **Family is not destiny.** Background can shape starting circumstances and available support, but never determines ability, personality, morality, success, or the player's future family choices.
6. **Player agency and uncertainty.** Partnership, parenthood, adoption, separation, reconciliation, caregiving, and support must arise from explicit choices and coherent events—not automatic assumptions based on age or gender.
7. **Age and dependency matter.** Children need represented guardianship and care. Adults may remain dependent or provide support. Dependency is not inferred solely from age.
8. **No free money or invisible liabilities.** Financial support and household contributions must use explicit, auditable transactions and cannot create negative balances or hidden debt.
9. **Cross-domain effects stay separated.** Family owns family relationships and responsibilities. Finance owns balances and transactions; School owns education; Work owns employment; Health/care mechanics belong to their owning systems. Shared consequences are explicit.
10. **No passive simulation theater.** Every field and recurring update must have a gameplay purpose, a clear owner, and tests. Do not simulate NPC lives in exhaustive detail.

## Domain model

### People

A family person has a stable ID, name and optional identity details, birth year (age is derived from the current simulated year), and only the persistent state required by implemented mechanics. An optional historical death year may describe pre-existing family background only. Future mortality belongs to the separate mortality system; do not invent a family-member death model here.

The player is represented by a stable player person ID in the family graph. Existing Character fields remain the authoritative player identity and stats; do not duplicate them into a second mutable player record.

### Relationship graph

Relationships connect two person IDs and include type (parent, guardian, sibling, partner, adoptive parent, or step-parent), direction for parent/guardian links (adult/guardian → child/dependent), start year, and optional end year for relationships that can end.

A person's role relative to the player is derived from graph links. Do not persist redundant labels or infer parental role from gender. Validate self-links, missing people, duplicate active links, invalid age ordering, and contradictory parent/guardian cycles.

### Relationship bonds

Each player-to-family-person bond may track closeness (emotional connection), trust (confidence/reliability), tension (unresolved conflict or strain), last meaningful interaction year/date, and explicit support received/provided only when an implemented financial or care mechanic records it.

These are not a single composite score. Do not apply arbitrary annual decay. Changes must follow actions, events, and modeled circumstances, with explanations in history.

### Household and dependency

Keep family membership distinct from living arrangements. The family graph records kinship/partnership/guardianship; household membership records who currently lives together; dependency records who relies on whom and why. A household arrangement in Finance is not proof of family support or co-residence. Moving out does not end a family relationship. Separation does not automatically end parenthood or guardianship.

### Family history

Record important family milestones and decisions with year/date, involved person IDs, event type, and a concise factual description. Examples include a relationship beginning/ending, a birth/adoption, a move, a reconciliation, support, a caregiving responsibility, or a bereavement. History is append-only from the player's perspective; corrections must be explicit and auditable.

## Lifetime progression

### Childhood
- A generated child has a plausible guardian/caregiver context represented by actual people and links.
- A child may have one or more parents/guardians, siblings, extended relatives, or a non-traditional household.
- Family support and household membership are distinct.
- Age-appropriate interactions are available; children cannot enter adult legal/financial agreements or independently provide adult financial support.
- Family circumstances can affect access to opportunities and events only through explicit rules.

### Teen years
- Family relationships can strengthen, become strained, or change through meaningful choices.
- Increasing independence is represented as a change in responsibilities/household arrangements, not automatic severance from family.
- Education, friendships, and family decisions can interact without merging their workspaces.

### Adulthood
- Partnership and parenthood are optional life paths, never automatic unlocks or assumed milestones.
- A relationship becoming a partnership requires explicit mutual progression and valid state; marriage or legal status should not be conflated with closeness.
- Parenthood can arise through biological birth, adoption, or other explicitly modeled routes. A child must have a stable identity, parent/guardian links, birth year, dependency, and care context.
- Remaining single, child-free, estranged, or without a conventional family structure are valid lives.
- Household and financial effects must be resolved through their owning systems.

### Midlife
- Support may flow in either direction: adults may support children, parents, partners, or other dependants; adults may also receive support.
- Caregiving must be a real responsibility with time/cost/consequence only after Health, Time, and Finance have complete contracts.
- Family transitions can affect work, education, wellbeing, and finances through explicit consequences.

### Later life
- Family relationships continue to matter but do not guarantee support or care.
- Dependants, caregiving, inheritance, estate settlement, and legacy require explicit people, assets, legal/role rules, and tested mechanics.
- Do not promise pension, family support, inheritance, or care merely because a relative exists.
- Bereavement and family-member mortality must integrate with the global mortality/terminal-state design, not use an unrelated random death roll.

## Interactions and meaningful choices

Interactions are targeted at a specific person and should communicate expected time, cost, prerequisites, and likely effects. Initial interaction types may include spending meaningful time together, reaching out/maintaining contact, working through a conflict, and providing financial support (adult-only, affordable, and posted through Finance's ledger).

Interaction outcomes update the relevant bond and record a history entry. Do not allow repeated actions to max relationships instantly; interactions are selected in the Family workspace as stamina-backed weekly activities. Use context and cooldown rules where needed, not an arbitrary action quota or player-managed calendar.

Family actions must be validated in the simulation. UI disabling is convenience only. Failed actions leave all state unchanged.

## Events and lifecycle operations

Future family events should be authored around context and relationship state: gatherings/milestones, conflict and reconciliation, requests for help, partnership changes, parenthood/adoption decisions, childcare/school transitions, caregiving when health/care systems exist, and bereavement after global mortality is implemented.

Events need stable IDs, eligibility, cooldowns, real choices, costs, immediate/delayed effects, and history. Avoid repetitive notification spam and moralizing choices.

Adding a child, partner, guardian, or adoptive relationship must be an atomic graph operation: validate all people/links/dependency constraints first, then commit the whole change. Ending a partnership must not delete people or parent-child links. Adoption/foster/guardianship must not be treated as interchangeable with biological parenthood.

## Cross-system contracts

- **Finance:** support, shared expenses, dependants, gifts, inheritance, and estate operations must be explicit transactions; no family wallet or duplicate ledger.
- **Life/Wellbeing:** bonds and events may affect happiness or stress only through bounded, explainable rules with recovery paths.
- **Education:** guardian/dependent state can influence school access, fees, attendance, and support when those mechanics exist.
- **Work:** caregiving or family events may affect availability only when the time/schedule model supports it.
- **Personal Technology:** device access may enable communication, but no family interaction should require owning a phone unless the specific activity genuinely requires it; provide alternatives.
- **Weekly activity:** family interactions are toggled directly in Family and consume stamina; they do not reserve calendar periods. The effects resolve during the weekly turn. Future caregiving must use the same activity-effort model when its mechanics exist.

## Generation and representation

- Generate only a modest, plausible family-of-origin context for new characters; never assume a partner or children.
- A generated family may be single-parent or two-parent and may include a small number of siblings. Do not assume every relative lives in the player's household.
- Names must be consistent with the character's existing country/name context; do not infer traits or ability from family background.
- For older starting ages, any already-deceased relatives are historical background facts, not evidence of an implemented future mortality simulation.
- A current-schema character may require an explicit family-background initialization when no graph is present. Do not silently invent a detailed family for an established character during load. Unsupported older save schemas are rejected without migration; any persisted shape change requires a deliberate schema update.

## Persistence and invariants

Family state is represented in the current Character schema and validated as part of the current save. Incompatible shape changes require a top-level schema update; old saves are not migrated. Validate unique stable person and relationship IDs; existing relationship endpoints; no self-links or duplicate active edges; acyclic parent/guardian graph; plausible age ordering; finite integer bond values in 0–100; valid household/dependent IDs; unique player ID; support bounded by available funds and recorded once in Finance; and historical end/death dates not before birth/start dates.

Save/load, all three slots, debug snapshot, and history must preserve the graph without losing or duplicating data.

## Staged implementation

1. **Implemented — domain foundation:** person/relationship/bond/household/dependency types; graph validation; family-of-origin generation for new saves; current-schema persistence.
2. **Implemented — playable relationship loop:** targeted interactions, action/time validation, bond changes, family history, and auditable support transactions.
3. **Family lifecycle:** explicit partnership, separation, parenthood, adoption, guardianship, and household changes with graph invariants.
4. **Dependants and care:** childcare, education support, caregiving, shared household costs, and time/finance consequences.
5. **Family events:** contextual events, delayed consequences, reconciliation, milestones, and bereavement integrated with mortality.
6. **Later-life and legacy:** support networks, estate/inheritance, dependants, and generational continuation after the underlying systems are complete.

A stage is not complete because a screen exists. Each stage requires simulation tests, save/load tests, deterministic replay, cross-system accounting checks, and scenario playthroughs.

## Initial implementation boundary

The implemented foundation establishes a real persistent family graph, a targeted interaction loop, and a one-time contextual family reconnection event for adults when higher-priority starter events are exhausted. The prompt is not repeated after it is resolved or passed. It should not claim that partnership, birth, adoption, childcare, caregiving, family mortality, inheritance, or generational play are implemented until those mechanics exist and are tested.

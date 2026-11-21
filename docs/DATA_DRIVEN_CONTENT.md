# Data-Driven Content Architecture

**Status:** Approved implementation direction; first content domain migrated incrementally.

## Purpose

Game content should be straightforward to add, adjust, disable, and remove without rewriting reusable simulation mechanics. A definition can be temporarily disabled with its optional enabled flag or permanently removed from the catalogue. Content definitions are data; rules that interpret and resolve them remain TypeScript.

This is an incremental architecture, not a request to move every existing game system into JSON at once. Migrate a domain when its catalogue and rules are understood and the change can preserve existing gameplay and saves.

## Full gameplay data-control requirement

The target is maximum practical data control across the authored game experience. This is broader than catalogues. Definitions should control, wherever the existing runtime supports them:

- **Player-facing presentation:** names, titles, descriptions, explanatory text, button labels, action labels, result messages, icons, ordering, grouping, visibility, contextual prompts, and age/stage-specific copy.
- **Available interactions:** action IDs, owning domain/location, availability, eligibility, prerequisites, costs, confirmation text, choices, cooldowns, and the outcomes shown to the player.
- **Stats and resources:** stat definitions, stable IDs, labels, descriptions, value ranges, initial values where applicable, display metadata, and supported relationships between stats. Domain-specific state remains owned by its domain.
- **Costs and rewards:** cash and account movements, items, assets, skills, attributes, health/wellbeing, education, career progress, relationships, reputation, and other explicitly supported resource/stat changes.
- **Consequences and timing:** immediate and delayed effects, recurring obligations, upkeep, risks, follow-up events, history entries, and cross-domain consequences.
- **Progression and availability:** unlocks, age/life-stage gates, requirements, opportunities, branches, and content activation/deactivation.

A content author should be able to add, tune, reorder, disable, or remove a supported action or opportunity—including its presentation, conditions, costs, choices, and rewards—by changing validated content definitions rather than writing a one-off screen or hardcoding another button. Domain screens should render available actions from domain-provided, data-backed descriptors; they should not maintain a second hardcoded action catalogue.

This requirement does not mean arbitrary UI markup or executable code belongs in JSON. Presentation definitions select from a finite set of approved UI components and layout patterns. Conditions and effects use a finite, typed vocabulary. TypeScript owns the renderer, validation, domain-specific resolution, transactions, and genuinely novel mechanics. If a new mechanic cannot be expressed safely with supported effects, implement it once in its owning domain and expose it as a reusable capability.

## Automatic dependency propagation

A content definition is the single source of truth for every dependent experience. Consumers must resolve values from the validated registry by stable ID; they must not copy titles, prices, requirements, prerequisites, rewards, or progression links into a second screen-specific catalogue.

The required flow is:

1. A JSON change is loaded and validated at build/runtime before it is registered.
2. Stable IDs and every cross-definition reference are checked. Invalid content fails clearly; it is never silently ignored or replaced by stale hardcoded values.
3. Domain queries expose the authoritative definitions and computed availability/outcomes.
4. Every dependent screen, tree, listing, action prompt, cost/reward preview, simulation result, and history presentation reads from that same domain API or registry.
5. A content change is reflected on the next application build/load without a manual synchronization step or a second code edit. If the change requires a capability the engine does not support, validation or implementation review must identify that gap explicitly.

Derived views must be projections, not parallel catalogues. A progression tree derives its nodes, connections, labels, requirements, layout positions, and status from the validated programme definitions and authoritative character state. Eligibility explanations and enrollment checks must share one domain rule so they cannot disagree.

Historical records and already-agreed transactions retain the snapshots needed to explain what happened. Removing or disabling a definition prevents new use, but does not rewrite a character's past. Existing active commitments must be handled explicitly rather than silently changing their financial or progression terms.

**Acceptance criterion:** changing one supported content definition updates every current dependent gameplay experience automatically. No manual synchronization, duplicate configuration, or silent hardcoded fallback is permitted. A new engine capability is implemented once in TypeScript, then exposed through the validated data vocabulary.

## Responsibilities

- **JSON content:** configurable definitions across catalogues, player-facing copy, action descriptors, stat metadata, requirements, choices, costs, rewards, consequences, and progression. Definitions use stable IDs and explicit content versions.
- **TypeScript contracts and validation:** define allowed shapes, ranges, stat/resource identifiers, UI component kinds, action types, condition/effect vocabularies, references, and content compatibility. Validate content before it can affect gameplay or appear in the UI.
- **TypeScript domain systems:** expose available actions and supported state/stat queries, and own eligibility, state transitions, simulation outcomes, atomic financial accounting, history, and cross-domain consequences. UI renders descriptors and dispatches stable action IDs; it does not reimplement game rules.
- **Character saves:** store a character's actual history and current state, not copies of every catalogue definition or a second progression tree. Existing records retain stable content IDs and meaningful historical snapshots where required.

## Content safety and compatibility

1. IDs are stable identifiers, not display labels. Do not reuse an ID for a different meaning. Stat, resource, action, effect, content, and UI-definition IDs must have explicit ownership and validated references.
2. Validate content version, required fields, ranges, enum values, duplicate IDs, and references before registering a catalogue.
3. Unknown or malformed content must fail clearly; do not silently skip invalid definitions or invent defaults.
4. Removing a definition must not corrupt an existing save. Domain code must handle an unavailable historical reference explicitly: preserve the record, show an unavailable/legacy state where needed, and prevent new enrollment/purchases/actions that require the removed definition.
5. Content format versions and save schema versions are separate. Editing catalogue content does not automatically require a save migration. Persisted character shape changes still require a deliberate save-schema change and tests.
6. Do not embed arbitrary executable scripts in JSON. Declarative conditions and effects must use a finite, typed, validated vocabulary with explicit domain ownership.
7. New mechanics that cannot be expressed by an existing supported rule require a TypeScript implementation and tests. Data-driven does not mean logic-free. Implement the capability once in its owning domain, then make it available to content definitions where safe.

## Current pilot: Education

Implemented on the feature branch:

- Education programme definitions are stored in `web/src/lib/content/education-programs.json` under `contentVersion: 1`.
- `education-content.ts` validates each definition at runtime, including stable unique IDs, age ranges, duration, tuition, education levels, prerequisite metadata, ability thresholds, fields, subject definitions, and progression-link references.
- `education.ts` consumes the validated catalogue while retaining ownership of eligibility, enrollment, tuition accounting, weekly progress, grade resolution, completion, and qualification awards. Programme availability and its explanation come from one shared domain query.
- Programme enablement, age fallback, entry thresholds, field choices, subjects, and optional progression-tree connections are content values. Subject `{field}` is the one supported display substitution.
- The education tree derives enabled nodes, required prerequisite links, optional links, labels, costs, durations, age ranges, and subjects from the same catalogue/domain query. Existing node positions are content metadata; new entries receive a deterministic fallback position, so adding a programme does not require a TypeScript coordinate entry.
- The active Education workspace resolves the current programme title from the catalogue. Persisted enrollment terms and historical records remain snapshots so a later content edit does not retroactively alter an existing commitment.
- Existing programme IDs and current gameplay behavior are preserved. No character save fields or save schema version were changed.

## Current pilot: Skills

Implemented on the feature branch:

- `skills.json` defines canonical skill IDs, labels, gameplay groups, and legacy-save starting baselines. Baselines use a finite, validated set of existing Character attributes; saved skill progress remains authoritative.
- Every education field option in the current education catalogue is explicitly mapped to a defined skill. Unknown future fields use the General Learning fallback rather than generating unregistered skill IDs.
- Every career role declares its own skill reference in `career-roles.json`. This distinguishes roles such as IT support and software development while preserving the existing career-path mapping as a fallback for legacy employment records.
- Skill-content validation checks duplicate IDs and aliases, valid baseline attributes, complete education-field coverage, and valid skill references for every career role.
- Existing skill IDs and `Character.skills` storage remain compatible. No save-schema migration is required.
- `skill-acquisition.json` defines validated, source-specific rewards for study, exercise, social interaction, family interaction, work, interviews, education tasks, and business ownership/management. Domain APIs apply these rules; unsupported actions do not invent skill gains.
- Skills now influence relevant outcomes: academic task performance, family relationship interactions, hiring/interview chances, extra-shift pay, career performance growth, business returns, and fitness gains.
- Skill acquisition coverage, gameplay effects, and the player-facing skill progression experience remain separate follow-up implementation slices; this catalogue migration does not claim those systems are complete.

## Next migration boundaries

- Establish shared typed registries/contracts for stats and resources, UI/action descriptors, requirements, choices, costs, rewards, and effects. Keep domain-specific validation and resolution in the owning domain; build shared vocabulary from real cross-domain use cases rather than speculative abstractions.
- **Career pilot implemented:** the 12 existing role definitions now live in `web/src/lib/content/career-roles.json` and are loaded through `career-content.ts`, which validates role IDs, path IDs, age/attribute/qualification requirements, salary ranges, and next-role links. Work still owns eligibility, listings, applications, interviews, offers, employment and promotion resolution. Existing role IDs and Character save shapes are unchanged.
- **Employer catalogue pilot:** the eight existing fictional employer/sector pairs live in a versioned, validated `career-employers.json` catalogue. Work continues to generate deterministic weekly listings and assign employers; no persistent company state or vacancy simulation is introduced by this slice.
- **Skills pilot implemented:** canonical skill labels, education-field aliases, and career-path mappings now live in a versioned, validated `skills.json` catalogue. Skill fallback formulas and progress resolution remain in TypeScript.
- Next, establish only the shared typed contracts that recur across the migrated domains (for example, stable stat/resource references and common validation primitives). Keep action, condition, cost, reward, and effect resolution in their owning domains until concrete cross-domain use cases justify shared vocabulary.
- Then consider products, events, and other catalogues individually. Do not mass-convert domain logic or make a generic rules engine before concrete repeated use cases justify it.
- Progression trees remain read-only projections of authoritative domain state; they must not create a parallel progression database.

## Validation expectations

Every migrated catalogue needs tests for valid definitions, invalid content, duplicate IDs, references, and compatibility with existing saves/history. Domain tests must prove that content-driven eligibility and outcomes match the established rules.

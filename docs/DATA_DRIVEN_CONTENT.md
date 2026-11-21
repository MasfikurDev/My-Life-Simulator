# Data-Driven Content Architecture

**Status:** Approved implementation direction; first content domain migrated incrementally.

## Purpose

Game content should be straightforward to add, adjust, disable, and remove without rewriting reusable simulation mechanics. A definition can be temporarily disabled with its optional enabled flag or permanently removed from the catalogue. Content definitions are data; rules that interpret and resolve them remain TypeScript.

This is an incremental architecture, not a request to move every existing game system into JSON at once. Migrate a domain when its catalogue and rules are understood and the change can preserve existing gameplay and saves.

## Responsibilities

- **JSON content:** configurable definitions such as education programmes, career roles, products, institutions, events, opportunities, and progression options. Definitions use stable IDs and explicit content versions.
- **TypeScript contracts and validation:** define allowed shapes, ranges, enum values, references, supported conditions/effects, and content compatibility. Validate content before it can affect gameplay.
- **TypeScript domain systems:** own eligibility, state transitions, simulation outcomes, financial accounting, history, and cross-domain consequences. UI reads domain results and does not implement game rules.
- **Character saves:** store a character's actual history and current state, not copies of every catalogue definition or a second progression tree. Existing records retain stable content IDs and meaningful historical snapshots where required.

## Content safety and compatibility

1. IDs are stable identifiers, not display labels. Do not reuse an ID for a different meaning.
2. Validate content version, required fields, ranges, enum values, duplicate IDs, and references before registering a catalogue.
3. Unknown or malformed content must fail clearly; do not silently skip invalid definitions or invent defaults.
4. Removing a definition must not corrupt an existing save. Domain code must handle an unavailable historical reference explicitly: preserve the record, show an unavailable/legacy state where needed, and prevent new enrollment/purchases/actions that require the removed definition.
5. Content format versions and save schema versions are separate. Editing catalogue content does not automatically require a save migration. Persisted character shape changes still require a deliberate save-schema change and tests.
6. Do not embed arbitrary executable scripts in JSON. Declarative conditions and effects must use a finite, typed, validated vocabulary with explicit domain ownership.
7. New mechanics that cannot be expressed by an existing supported rule require a TypeScript implementation and tests. Data-driven does not mean logic-free.

## Current pilot: Education

Implemented on the feature branch:

- Education programme definitions are stored in `web/src/lib/content/education-programs.json` under `contentVersion: 1`.
- `education-content.ts` validates each definition at runtime, including stable unique IDs, age ranges, duration, tuition, education levels, prerequisite metadata, ability thresholds, fields, and subject definitions.
- `education.ts` consumes the validated catalogue while retaining ownership of eligibility, enrollment, tuition accounting, weekly progress, grade resolution, completion, and qualification awards.
- Programme enablement, age fallback, entry thresholds, field choices, and subject names are content values. Subject `{field}` is the one supported display substitution.
- Existing programme IDs and current gameplay behavior are preserved. No character save fields or save schema version were changed.

## Next migration boundaries

- Add a shared typed vocabulary for reusable requirements and effects only when multiple real domains need the same semantics. Keep domain-specific validation and resolution in the owning domain.
- Migrate career-role definitions after reviewing their current eligibility, promotion, salary, and save-reference behavior.
- Then consider products, events, and other catalogues individually. Do not mass-convert domain logic or make a generic rules engine before concrete repeated use cases justify it.
- Progression trees remain read-only projections of authoritative domain state; they must not create a parallel progression database.

## Validation expectations

Every migrated catalogue needs tests for valid definitions, invalid content, duplicate IDs, references, and compatibility with existing saves/history. Domain tests must prove that content-driven eligibility and outcomes match the established rules.

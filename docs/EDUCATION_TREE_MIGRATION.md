# Education Progression Tree Migration

**Status:** Incremental implementation plan  
**First implementation slice:** Live education programme tree  
**Scope:** The Life Tree's education domain and its projection of existing education state

## Purpose

The Life Tree is a live map of progression opportunities, not a chronological decision log. The education tree is the first domain being migrated to this model. It should show the routes a character has completed, is pursuing, can enter now, or has not yet unlocked.

The tree is a view of the education system. It is not a second education engine and must not maintain a separate copy of academic progress.

## Migration rules

- Keep `education.ts` authoritative for programmes, enrollment eligibility, weekly academic resolution, grades, completion and qualification awards.
- Derive tree state from existing character data: education records, active enrollment, academic results, qualifications, age and relevant attributes.
- Do not add duplicated persisted tree progress or require a save migration for a read-only projection.
- Keep real prerequisites distinct from optional/parallel routes. A visual connection must not silently become an enrollment requirement.
- Preserve existing education records, academic history and qualification IDs. Do not rewrite or discard historical choices.
- Keep education as an age-aware system. Early development, school, vocational routes, higher education and professional learning must not be forced into one mandatory linear sequence.
- Follow the current weekly gameplay contract: education remains an automatic background responsibility. Do not introduce a day/period timetable or fixed weekly action quota as part of the tree.
- The Education workspace remains responsible for enrollment and current programme management. The Life Tree communicates route state and requirements.

## Staged migration

### Stage 1 — Education tree projection

- Build a typed, read-only projection from the existing programme catalogue and character state.
- Represent existing programmes as RPG-style nodes with completed, current, available and locked states.
- Show programme progress, age eligibility, institution, field, duration, tuition and the reason a route is locked.
- Connect existing prerequisite routes and keep vocational/professional certificates as optional routes rather than mandatory degree steps.
- Show current subject grades as smaller progress nodes in the selected programme details.
- Replace the Education tab's decision-history presentation with this live tree. Keep the other Life Tree domains unchanged for now.

### Stage 2 — Education tree interaction

- Add contextual actions only where the existing education engine already supports them.
- Keep enrollment, pause/resume and programme selection in the Education workspace until a single coherent interaction can be shared without duplicating business rules.
- Make node details explain requirements, cost, duration, current progress and the next valid action.
- Validate that the tree's available/locked state always agrees with `getAvailableEducationPrograms` and `enrollInEducation`.

### Stage 3 — Complete the education gameplay domain

- Expand age-specific learning experiences and programme content within the education domain before deep cross-system integration.
- Add subject/topic/skill/certification nodes only when backed by meaningful learning, assessment or credential mechanics.
- Preserve multiple routes: school completion, vocational training, independent certificates, degrees, specialist qualifications and adult retraining.
- Ensure grades, practical capability and formal credentials remain distinct outcomes.
- Improve activity outcome transparency without turning education into a manual timetable.

### Stage 4 — Migrate other Life Tree domains

- Migrate career, relationships, health, finance and wider life opportunities one domain at a time.
- Each tree must be backed by its owning system's real eligibility and progression rules.
- Keep decision history as history; do not use recorded decisions as a substitute for live progression state.
- Do not add decorative nodes, fake branches or speculative prerequisites.

## First-slice acceptance criteria

- Existing saves render without a schema migration.
- A character's current education programme and progress appear on the matching node.
- Completed school records and awarded qualifications mark the corresponding programme as completed.
- Age and existing programme requirements determine available/locked states.
- Subject grades are visible under the active programme.
- Multiple advanced and independent routes remain visible; the tree does not imply every credential is sequential.
- The existing Education workspace and weekly simulation behavior remain intact.
- Focused tests cover the tree projection, and the full web check/test/build runs before the PR is marked ready.

## Current limitations

The first slice is a visualization of the programme catalogue that already exists. It does not yet add new learning mechanics, new credentials, independent subject progression, new school activities, or live trees for the other Life domains. Those require their own staged implementation and validation.

# Implementation Plan — Weekly Activity Outcomes

**Spec:** `docs/superpowers/specs/2026-11-20-weekly-activity-effects-design.md`  
**Base:** `main`  
**Branch:** `feat/weekly-activity-outcome-ui`

## Global constraints
- Preserve the existing compact Weekly Review layout and domain-native workspace designs.
- Never infer stat deltas from prose reward strings.
- Keep simulation outcomes authoritative and deterministic.
- No invented stats, application rewards, or save-schema changes.
- Use existing UiBadge and semantic theme tokens.
- Keep the PR Draft until automated validation and the available responsive review are complete; report any unavailable runtime verification explicitly.

## Tasks

### 1. Expose structured weekly outcomes from the simulation

**Status: Implemented and automated validation passed.**
- Inspect the weekly resolver and existing review contracts.
- Add a failing test proving the review exposes actual per-activity effects and full changed-stat forecast, including correct inverse-metric tone metadata where applicable.
- Implement the smallest resolver-owned outcome contract; do not parse reward copy or run repeated full-week simulations to guess attribution.
- Preserve read-only preview and exactly-once resolution behavior.
- Test job applications, education tasks, work, care/rest, food/item use, family/social, and passive activity outcomes using existing mechanics.

### 2. Update Weekly Review presentation

**Status: Implemented; responsive layout reviewed at source level. Runtime screenshot verification unavailable.**
- Add failing component/contract tests for all changed metrics, no duplicate Combined Character Impact, compact badge rows, planned × control, automatic non-removable rows, and item disclosure.
- Replace the stamina-only forecast with the broader stat forecast while retaining stamina budget details in compact form.
- Remove Combined Character Impact.
- Render activity outcome/cost badges from structured simulation data; keep the existing expandable disclosure and footer controls.
- Ensure removing a planned activity recalculates forecast and financial totals immediately.

### 3. Reuse outcome badges in domain workspaces

**Status: Partially implemented by design.** Education task cards, Health & Wellbeing activity cards, and Work extra-earnings / career-development choices use resolver-backed previews. Family, Lifestyle/Supermarket/Inventory, and other activity-selection cards remain out of scope until they expose a trustworthy preview contract.
- Add shared badge presentation only where the owning domain exposes verified effects/costs/requirements.
- Keep domain-specific layout and interactions; do not force all cards into a generic template.
- Job applications show application submission/cost and pending result, not career progress. Interviews show pending/actual hiring state; work shows real pay, experience, performance, and applicable costs.
- Shopping and item-use details remain grouped behind contextual disclosure when lists are long.

### 4. Documentation and validation

**Status: Documentation synchronized; automated validation passed on code revision `f9dd553`.**
- Update Weekly Activity Review and relevant design/implementation docs after implementation.
- GitHub Actions validation on the reviewed code revision: Svelte check 0 errors / 11 warnings, Vitest 201 tests across 14 files, and production build succeeded.
- Responsive CSS source review covered the bounded dialog, wrapping activity headings/badges, min-width safeguards, and narrow-screen single-column stat layout. A connected browser preview was unavailable, so runtime visual verification remains explicitly unverified.
- Long simulation audit and pull request safeguards passed.
- Check CI, branch synchronization, and compatibility with the latest main before merging.

## Verification notes
The GitHub-connected editing environment does not provide a local checkout or shell access to the repository. GitHub Actions was used as the execution environment for repository checks. Browser access was unavailable during this review; do not claim screenshot-based visual verification.

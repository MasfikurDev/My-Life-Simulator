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
- Keep the PR Draft until all checks and visual review are complete.

## Tasks

### 1. Expose structured weekly outcomes from the simulation

**Status: Implemented; full validation pending.**
- Inspect the weekly resolver and existing review contracts.
- Add a failing test proving the review exposes actual per-activity effects and full changed-stat forecast, including correct inverse-metric tone metadata where applicable.
- Implement the smallest resolver-owned outcome contract; do not parse reward copy or run repeated full-week simulations to guess attribution.
- Preserve read-only preview and exactly-once resolution behavior.
- Test job applications, education tasks, work, care/rest, food/item use, family/social, and passive activity outcomes using existing mechanics.

### 2. Update Weekly Review presentation

**Status: Implemented; responsive visual review pending.**
- Add failing component/contract tests for all changed metrics, no duplicate Combined Character Impact, compact badge rows, planned × control, automatic non-removable rows, and item disclosure.
- Replace the stamina-only forecast with the broader stat forecast while retaining stamina budget details in compact form.
- Remove Combined Character Impact.
- Render activity outcome/cost badges from structured simulation data; keep the existing expandable disclosure and footer controls.
- Ensure removing a planned activity recalculates forecast and financial totals immediately.

### 3. Reuse outcome badges in domain workspaces

**Status: Partially implemented.** Education task cards, Health & Wellbeing activity cards, and Work extra-earnings / career-development choices use resolver-backed previews. Family, Lifestyle/Supermarket/Inventory, and any other activity-selection cards remain to be reviewed; do not add badges where a trustworthy preview is not available.
- Audit Education, Work, Lifestyle/Supermarket/Owned, Health, Family, Finance, and other activity selection cards.
- Add shared badge presentation only where the owning domain exposes verified effects/costs/requirements.
- Keep domain-specific layout and interactions; do not force all cards into a generic template.
- Job applications show application submission/cost and pending result, not career progress. Interviews show pending/actual hiring state; work shows real pay, experience, performance, and applicable costs.
- Shopping and item-use details remain grouped behind contextual disclosure when lists are long.

### 4. Documentation and validation

**Status: Documentation updated; automated validation passed on the implementation revision. Final CSS cleanup requires one last workflow rerun; responsive visual review remains pending.**
- Update Weekly Activity Review, Visual Design, and relevant domain docs after implementation.
- GitHub Actions validation passed on the implementation revision: Svelte check 0 errors / 11 warnings, Vitest 201 tests across 14 files, and production build succeeded. Re-run after the final CSS cleanup.
- Review responsive behavior at 320, 360, 390, 430, 768, 1024, and 1440 CSS px where browser preview is available.
- Verify no theme regressions, overflow, focus issues, or duplicate actions.
- Long simulation audit passed 4/4 stress scenarios; pull request safeguards passed.
- Keep the PR Draft; report exactly what is implemented and what remains unverified.

## Verification notes
The GitHub-connected editing environment does not provide a local checkout or shell access to the repository. Use the branch's GitHub Actions CI as the execution environment for the required repository checks; do not claim checks pass until their run results are read. If browser preview cannot be opened, report visual verification as outstanding.

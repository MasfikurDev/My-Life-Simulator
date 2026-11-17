## Summary
<!-- What changed, why, and which user-visible or internal outcome is intended? -->

## Record of change
- **Related issue / request:** <!-- Link issue, discussion, or write "Direct user request". -->
- **Decision or requirement:** <!-- State the approved requirement; distinguish decisions from implementation suggestions. -->
- **Affected behavior / systems:** <!-- Name the owning domains, screens, data, workflows, or docs. -->
- **Compatibility / preservation:** <!-- What existing behavior, saved data, contracts, or workflows must remain unchanged? -->
- **Follow-up / deferred work:** <!-- Link follow-up work or write "None". -->

## Scope and preservation
- [ ] The change stays within the stated scope.
- [ ] I inspected the full diff, including deleted and renamed files.
- [ ] Existing approved behavior, features, navigation, save data, and tests are preserved unless explicitly listed below.
- [ ] No unrelated refactor or cleanup is bundled into this PR.
- [ ] I checked open PRs and recent merged work for overlap; any dependency or supersession is recorded above.

## Validation
- [ ] Relevant focused tests were added or updated for the reported behavior.
- [ ] Web validation (Svelte check, Vitest, production build) passes when web code or its workflow changes.
- [ ] Cross-domain changes include integration/regression coverage.
- [ ] The long simulation suite passes when this PR changes `web/src/lib/**`, the web package scripts/lockfile, or `.github/workflows/web.yml`. Manual dispatch of `web.yml` runs it explicitly.
- [ ] UI changes were checked in the actual affected screen and at narrow Android/mobile width.
- [ ] Documentation was updated where behavior, architecture, or approved direction changed.

## Risks / intentionally removed behavior
<!-- Explicitly list removals, save-format changes, behavior changes, or write "None". -->

## Evidence
<!-- Link exact Actions runs/checks, screenshots, logs, deployed result, or explain what could not be verified. Include the tested commit when useful. -->

## Decision record
<!-- For durable product, architecture, data, security, or workflow decisions only. Link a decision record in docs/decisions/ when this PR establishes or changes one. Otherwise write "No durable decision; implementation follows existing direction." -->

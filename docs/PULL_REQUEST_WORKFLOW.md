# Pull Request Workflow

**Status: Required project workflow.** Use this process for substantial feature work, fixes, refactors, and documentation changes that benefit from review. Draft status is an intentional development state, not a signal that work is abandoned.

## 1. Start with a draft PR

- Create a focused feature/fix branch from the latest `main`.
- Open the pull request as a **Draft** as early as practical, once there is a meaningful implementation direction to review.
- Keep it in draft while implementation is in progress.
- Use the draft PR as the working place for incremental commits, discussion, screenshots, test results, and scope adjustments.

## 2. Iterate while it is a draft

A draft PR is the normal place for unfinished work and last-minute changes:

- Implement and refine the feature without implying it is merge-ready.
- Run focused tests and relevant simulations as the work develops.
- Review UI behavior and screenshots where applicable.
- Make requested or discovered corrections directly on the branch.
- Update the PR description when scope, behavior, risks, or validation results change.
- Keep changes focused; split unrelated work rather than letting one PR become a catch-all.

Draft status does **not** remove the need to run checks, communicate blockers, or keep the branch reasonably current.

## 3. Mark ready only after implementation is complete

Convert the PR from draft to ready for review only when:

- The agreed scope is implemented.
- Relevant tests and simulations have been added or updated.
- Required validation has passed, or any remaining failure is clearly explained and accepted for review.
- A self-review has checked the complete diff for accidental deletions, unrelated changes, duplicated UI, regressions, and undocumented behavior.
- Affected canonical project documentation has been updated in the same change.

## 4. Final merge gate

Immediately before merging:

1. Compare the PR branch with the **latest `main`** and integrate current `main` safely.
2. Resolve conflicts deliberately; never discard existing `main` behavior or user-approved work merely to make a branch merge.
3. Re-run the required CI checks against the final branch state.
4. Inspect the final diff and confirm the PR still matches its stated scope.
5. Merge only when checks and review are satisfactory.

A green check from an earlier commit is not proof that the latest PR state is valid. Draft status is not a substitute for branch synchronization, conflict resolution, or regression checks.

## 5. Keep `main` stable

- Do not merge unfinished work just to make it available.
- Do not mark a PR ready merely because its first implementation exists.
- Keep independent work in separate branches/PRs when practical.
- Close obsolete or unrecoverable PRs with a clear explanation; do not leave ambiguous work appearing active.
- Do not merge unless the user has explicitly authorized merging.

## Lifecycle at a glance

`Branch → Draft PR → Implement / Test / Refine → Ready for Review → Sync with latest main → Final CI + Diff Review → Merge`

This is the default lifecycle for the My Life Simulator repository. Exceptions should be deliberate and explained, not accidental.

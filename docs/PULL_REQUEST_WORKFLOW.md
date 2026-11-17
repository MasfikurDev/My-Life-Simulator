# Pull Request Workflow

**Status: Required project workflow.** Use this process for substantial feature work, fixes, refactors, and documentation changes that benefit from review. Draft status is an intentional development state, not a signal that work is abandoned.

## 1. Start with a draft PR

- Create a focused feature/fix branch from the latest `main`.
- Inspect current open PRs, recent merged work, and the owning files before creating parallel work.
- Open the pull request as a **Draft** as early as practical, once there is a meaningful implementation direction to review.
- Keep it in draft while implementation is in progress.
- Use the draft PR as the working place for incremental commits, discussion, screenshots, test results, and scope adjustments.

## 2. Keep the PR record current

The PR is the primary record for an individual change. Its description must stay useful as work evolves:

- State the request, approved requirement, intended outcome, affected systems, and scope.
- Link the originating issue/discussion when one exists. For direct user requests, say so rather than inventing an issue.
- Record dependencies, overlapping work, compatibility constraints, and behavior intentionally changed or removed.
- Keep validation evidence tied to actual GitHub Actions runs and the commit that was tested. Distinguish code validation, simulation audits, deployment, and visual verification.
- Update the PR description when scope, behavior, risks, decisions, or validation results change. Do not rely on chat history as the only record.

## 3. Iterate while it is a draft

A draft PR is the normal place for unfinished work and last-minute changes:

- Implement and refine the feature without implying it is merge-ready.
- Run focused tests and relevant simulations as the work develops.
- Review UI behavior and screenshots where applicable.
- Make requested or discovered corrections directly on the branch.
- Keep changes focused; split unrelated work rather than letting one PR become a catch-all.
- If a material requirement or approved decision changes, record the decision and its impact in the PR before proceeding.

Draft status does **not** remove the need to run checks, communicate blockers, or keep the branch reasonably current.

## 4. Record durable decisions selectively

Do not create a decision document for every code change. Use a short Architecture/Decision Record (ADR) only when a change establishes or reverses a durable product, gameplay, architecture, data, security, or delivery rule that future work must follow.

- Store ADRs in `docs/decisions/` using the next sequential number and a concise kebab-case title.
- Include status, date, context/problem, decision, consequences/trade-offs, alternatives considered when material, and links to the approving PR and superseded ADR (if any).
- Mark replaced decisions as **Superseded** and link the replacement. Do not silently edit history to make an old decision appear current.
- Link the ADR from the PR and the relevant canonical document. The canonical document remains the operational source of truth; ADRs explain why the decision exists.
- Keep transient implementation details, ordinary fixes, and speculative ideas in the PR or owning document, not in ADRs.

The templates and retention rules are in [Change and Decision Records](CHANGE_RECORDS.md).

## 5. Mark ready only after implementation is complete

Convert the PR from draft to ready for review only when:

- The agreed scope is implemented.
- Relevant tests and simulations have been added or updated.
- Required validation has passed, or any remaining failure is clearly explained and accepted for review.
- A self-review has checked the complete diff for accidental deletions, unrelated changes, duplicated UI, regressions, and undocumented behavior.
- Affected canonical project documentation has been updated in the same change.
- The PR description contains enough context and evidence to understand and verify the change without reconstructing the chat.

## 6. Final merge gate

Immediately before merging:

1. Compare the PR branch with the **latest `main`** and integrate current `main` safely.
2. Resolve conflicts deliberately; never discard existing `main` behavior or user-approved work merely to make a branch merge.
3. Re-run the required CI checks against the final branch state.
4. Inspect the final diff and confirm the PR still matches its stated scope.
5. Confirm the PR description, linked decision records, and affected canonical docs agree with the final implementation.
6. Merge only when checks and review are satisfactory.

A green check from an earlier commit is not proof that the latest PR state is valid. Draft status is not a substitute for branch synchronization, conflict resolution, or regression checks.

## 7. Close an unmerged PR with an explicit outcome

Before closing a PR without merging, add a final PR conversation comment using the **Unmerged PR closure record** in [Change and Decision Records](CHANGE_RECORDS.md). Record the actual reason, whether it is superseded/duplicated/obsolete/blocked/abandoned/experimental, any replacement PR or commit, useful ideas retained, and branch disposition. If information is unknown, say **Unknown**; do not invent a reason. Preserve useful work through a linked replacement or a concise note in the owning document when it remains relevant.

Do not close merely because a PR is old. First decide whether to continue, rebase/re-specify, supersede, or intentionally retain it as an audit/reference branch.

## 8. Keep `main` stable

- Do not merge unfinished work just to make it available.
- Do not mark a PR ready merely because its first implementation exists.
- Keep independent work in separate branches/PRs when practical.
- Close obsolete or unrecoverable PRs with a clear explanation and closure record.
- Do not merge unless the user has explicitly authorized merging.

## Lifecycle at a glance

`Branch → Draft PR → Implement / Test / Refine → Ready for Review → Sync with latest main → Final CI + Diff Review → Merge`

This is the default lifecycle for the My Life Simulator repository. Exceptions should be deliberate and explained, not accidental.

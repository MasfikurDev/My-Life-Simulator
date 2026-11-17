# GitHub Copilot Instructions

For My Life Simulator, read `docs/AI_WORKING_RULES.md` before making changes. The repository's canonical AI rules and product documents remain authoritative.

## Mandatory PR batching rule (temporary cost-control policy)

Until the repository's CI costs have been reviewed and explicitly optimized, use **one active development draft PR at a time** as the default workflow.

- Before starting work, inspect the open PR list and current `main` head. If an active in-scope draft PR exists, continue on its branch when the work belongs to the same development batch. Do not open another PR for a separate small feature or fix merely to isolate it.
- Group related work into one coherent batch PR. Keep changes understandable through focused, logically separated commits; do not collapse unrelated work into an opaque mega-commit.
- Keep the batch PR in **draft** throughout implementation and iteration. Add commits and update the same PR rather than creating repeated PRs for each task.
- Avoid repeatedly triggering expensive CI while the PR is draft. When the batch is complete, inspect the full diff, review removals and risks, and run the required comprehensive validation once. Then mark the PR ready for review.
- Do not mark a PR ready, merge it, or claim it is validated until the relevant checks have actually passed on the latest commit. Never merge without the user's explicit instruction.
- Create a separate PR only when the work is independently risky, too large to review safely as one batch, requires a distinct review/release boundary, or cannot reasonably share the existing branch.
- If there is no active in-scope PR, create one draft PR for the next coherent batch. Do not create a PR for every individual request.
- This is a temporary hard rule for cost control, not a permanent architectural constraint. Change it only after the user explicitly approves a revised CI-cost strategy.

This rule governs GitHub repository development and PR handling. It does not authorize skipping necessary validation, weakening correctness, or merging incomplete work.

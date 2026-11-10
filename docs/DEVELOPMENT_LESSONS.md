# Development Lessons and Reliability Guardrails

**Purpose:** Record recurring development failures, the remedies we have tried, how well they have worked, and the checks future changes must apply.
**Reviewed:** 2026-11-10

This is a qualitative retrospective based on recurring development conversations and confirmed repository documentation. Effectiveness is not a measured percentage. A remedy is marked **proven** only where the repository or test history confirms it; workflow changes that have not yet been used repeatedly are marked **promising**.

## Recurring problems and what we learned

| Problem pattern | What happened / evidence | Remedy adopted or recommended | Effectiveness so far |
|---|---|---|---|
| Features or approved behavior disappeared during PR integration | Branches fell behind `main`; changes were lost or overwritten while trying to catch up or resolve conflicts. This caused repeated recovery work and uncertainty about what survived. | Start from latest `main`; compare complete base/head diffs; preserve current-main behavior deliberately; inspect changed files and deletions; add regression tests for recovered behavior; re-run CI on the final branch state. | **Partially effective.** The rules are now explicit, but the recurrence shows that relying on memory or a quick merge review is insufficient. |
| PRs were treated as finished too early | Work still needed last-minute changes, UI refinement, or validation after the first implementation. | Use the draft-first PR lifecycle: keep the PR in draft during implementation, testing and refinement; mark it ready only after self-review and validation; merge only with explicit authorization. The detailed lifecycle is maintained separately in the repository workflow documentation. | **Promising.** The workflow is documented, but needs consistent use across future PRs before it can be called proven. |
| A requested fix did not visibly change the product | A PR or implementation claim was made, but the user still saw the old behavior or broken styling. | Verify the actual changed source, inspect the final diff, run the relevant checks, and verify the resulting screen/deployed behavior. If visual verification is unavailable, state that limitation. | **Effective when applied.** It prevents treating a code edit or merged PR as proof of a user-visible fix; visual verification still needs to be performed separately. |
| Local tests passed while integrated gameplay remained flawed | Individual mechanics can pass while age gates, stamina, affordability, progression, finance, history, and delayed consequences interact incorrectly. | Test domain rules and cross-domain scenarios. Run representative multi-week/multi-year simulations in a separate CI job where appropriate; check survival, resources, exploit loops, deterministic replay, save/load continuity, and delayed outcomes. | **Promising.** Integration reviews and scenario simulations have exposed important gaps; coverage still needs to expand across ages and starting conditions. |
| Cross-domain changes bypassed authoritative state or accounting | Confirmed examples included event costs and delayed money effects changing cash without financial-ledger entries, plus transaction-ID collisions after the ledger cap. | Keep one owner per fact; route money through shared Finance operations; make multi-domain changes atomic; preserve ledger and balance invariants; add regression tests for both immediate and delayed effects. | **Proven for the confirmed cases.** The fixes and regression coverage are recorded as implemented on `main` in [System Integration Review](SYSTEM_INTEGRATION_REVIEW.md). Continue auditing new cross-domain paths. |
| UI fixes became inconsistent or regressed elsewhere | Styling, spacing, navigation states, headers, duplicate controls, and copy needed repeated corrections across domains. | Follow the existing [UI Engineering Skill](../.github/skills/ui-engineering/SKILL.md); reuse semantic tokens and shared primitives; inspect the owning workspace and its navigation; verify narrow and wide layouts; remove duplicate actions and unnecessary copy. | **Partially effective.** The skill and token system provide concrete standards, but repeated regressions show they are not yet applied consistently to every UI change. |
| Product language drifted away from the intended game | Player-facing text sometimes sounded like a family-services/case-management product or exposed internal system language. | Apply the copy rules in [AI Working Rules](AI_WORKING_RULES.md) and [Current Direction](CURRENT_DIRECTION.md): use concise, natural game language; describe people and choices rather than internal processing; preserve internal IDs and mechanics. | **Partially effective.** The direction is now explicit, but copy audits must cover all affected screens, not only the screen named in a request. |
| Documentation became stale, contradictory, or scattered | Old specifications and chat decisions could conflict with newer decisions; agents sometimes acted on incomplete context. | Treat the repository as source of truth; read the mandatory docs before work; update the canonical document in the same PR as behavior changes; mark implemented, partial, and planned accurately; add links from the README. | **Partially effective.** Canonical docs and AI rules are extensive, but their size and duplicated rules create a maintenance burden. Prefer editing the owning section over appending another overlapping rule. |
| CI/deployment failures were misdiagnosed or workflows became noisy | Build failures, deployment failures, account/repository mismatches, and redundant CI work were easy to conflate. | Inspect the exact failed job and step logs; compare recent run timings; preserve path filters and least-privilege permissions; keep one validation/build pass; isolate expensive simulation jobs from fast PR feedback; use GitHub Pages as the only active deployment target. | **Effective for diagnosis; ongoing for optimization.** Log inspection has identified concrete causes, while CI boundaries and timing still need evidence-based tuning. |

## Required safeguards for every change

### Before implementation
- Read the mandatory project documents and the owning domain specification.
- Inspect the current implementation, relevant tests, recent commits, and open PRs that overlap the same files or behavior.
- Identify the authoritative owner of every state field affected by the change.
- State the intended scope and list existing behavior that must remain unchanged.
- Start a focused branch from the latest `main`; use a draft PR for work that benefits from review while it is still evolving.

### During implementation
- Make the smallest coherent change; do not rewrite adjacent systems to make the task easier.
- Add or update a regression test for the reported symptom, not only a broad happy-path test.
- For cross-domain changes, test both the local operation and its connected state, ledger, history, persistence, and UI projection.
- For UI changes, inspect the actual owning screen and reuse shared tokens/components. Do not patch one screenshot with arbitrary offsets.
- Keep expensive, long-running simulations separate from the fast validation path where the workflow supports it. Do not duplicate the same test/build work across jobs without a clear reason.
- Update affected canonical documentation in the same PR.

### Before marking a PR ready
- Compare the branch with the latest `main`; inspect the complete diff, especially deletions and files changed outside the stated scope.
- Confirm no approved feature, test, navigation item, or behavior was accidentally removed.
- Run the required checks against the latest branch state. A previous green run does not validate new commits.
- Review the product behavior, not just the code: verify the reported symptom and relevant adjacent flows.
- Check that documentation matches the implementation and labels planned work accurately.
- Keep unresolved failures and verification limitations visible in the PR description.

### Before merge
- Integrate the latest `main` deliberately and resolve conflicts without discarding existing behavior.
- Re-run CI and inspect the final diff after conflict resolution.
- Do not merge unfinished work or merge without the user's explicit authorization.

## Evidence and effectiveness policy

Use these labels in future retrospectives:

- **Proven:** the specific failure has a regression test or repeatable verification, and the fix is confirmed in the current code.
- **Partially effective:** the remedy has helped, but the same class of failure has recurred or coverage is incomplete.
- **Promising:** the remedy is documented or recently introduced, but there is not enough repeated use to judge its reliability.
- **Unproven:** there is no confirming evidence yet.

Do not upgrade a remedy's rating merely because a rule was written. Revisit this document when a recurring issue happens again, a new regression test is added, or a workflow change has been used successfully across several PRs.

## Related project references

- [AI Working Rules](AI_WORKING_RULES.md)
- [System Integration Review](SYSTEM_INTEGRATION_REVIEW.md)
- [Current Product and Gameplay Direction](CURRENT_DIRECTION.md)
- [CI and Delivery](CI_CD.md)
- [UI Engineering Skill](../.github/skills/ui-engineering/SKILL.md)

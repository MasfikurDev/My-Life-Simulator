# Change and Decision Records

**Purpose:** Make project history understandable from GitHub and the repository without needing to reconstruct old chats. Keep records concise, factual, linked, and proportional to the importance of the change.

## Record hierarchy

Use the smallest record that preserves the information future work needs:

1. **Pull request** — the default record for every change. It captures request, requirement, scope, implementation, risks, validation evidence, and outcome. Keep the PR description updated through merge or closure.
2. **Issue / discussion** — use when work needs independent tracking, prioritization, discussion, or acceptance criteria before implementation. Link the issue from the PR. Do not create an issue solely to add ceremony to a small direct request.
3. **Decision record (ADR)** — use only for durable decisions that constrain future product, gameplay, architecture, data, security, or delivery work.
4. **Owning specification** — describes the current operational rule. Update it when the approved behavior changes; link the rationale ADR where applicable.
5. **Development lessons / incident note** — record recurring or high-impact failures and verified remedies. Do not turn every transient CI failure into a permanent incident.

The repository is the long-term source of truth. Chat messages can provide context, but they are not the only record of a material decision or implementation outcome.

## What every PR should preserve

The PR description should let a future contributor answer:

- What request or problem led to this change?
- What requirement was actually approved, and what was merely an implementation choice?
- Which behavior, systems, files, or domains changed?
- What existing behavior, data, or contracts had to be preserved?
- Which tests and checks ran, against which commit, and what did they establish?
- What was not verified, what remains risky, and what follow-up is deferred?
- Was a durable decision made, and where is its rationale recorded?

Use links to exact GitHub Actions runs, commits, screenshots, deployment results, issues, and related PRs. Do not paste large logs when a stable link and concise diagnosis are enough. A passing build is not proof of visual correctness or production deployment.

## When to create an ADR

Create an ADR when a decision will materially guide future work or prevent repeated debate, for example:

- A change to the core gameplay loop or a cross-domain ownership contract.
- A persistence, save compatibility, data integrity, or security policy.
- A significant architecture or platform boundary.
- A lasting CI/CD, release, deployment, or repository workflow rule.
- An explicit reversal of a previously approved durable decision.

Do **not** create ADRs for routine bug fixes, isolated UI adjustments, refactors that preserve behavior, temporary experiments, or every individual feature. Record those in the PR and owning specification as appropriate.

### ADR naming and status

Use sequential filenames such as `docs/decisions/ADR-0001-short-title.md`. Check the highest existing number before creating one. Never reuse a number. ADR status is one of:

- **Proposed** — awaiting explicit approval.
- **Accepted** — approved and currently authoritative.
- **Rejected** — considered and not adopted.
- **Superseded** — replaced by a later ADR; link the replacement.

Only accepted decisions are binding. A proposal or PR suggestion does not become policy merely because it was written down.

### ADR template

```markdown
# ADR-NNNN: Short decision title

- **Status:** Proposed | Accepted | Rejected | Superseded
- **Date:** YYYY-MM-DD
- **Decision owners / approval:** Link the approving user decision or PR
- **Supersedes:** ADR-NNNN or None
- **Superseded by:** ADR-NNNN or None

## Context
What problem, constraints, and verified facts require a decision?

## Decision
State the chosen rule precisely. Separate approved requirements from implementation details.

## Consequences
What becomes easier, harder, constrained, or explicitly out of scope?

## Alternatives considered
List only credible alternatives and why they were not selected.

## References
Link the approving PR, relevant issues, and updated canonical specifications.
```

## Unmerged PR closure record

Before closing an unmerged PR, add a final comment. Copy and complete this structure; use **Unknown** where evidence is unavailable.

```markdown
### Unmerged PR closure record

- **Outcome:** Superseded | Duplicate | Obsolete | Blocked | Abandoned | Experiment/reference | Other
- **Reason:** Factual explanation for closing this PR.
- **Replacement:** PR/issue/commit link, or None.
- **Work retained:** Specific ideas, tests, commits, or behavior preserved elsewhere; or None identified.
- **Work not retained:** What is intentionally discarded, or Unknown.
- **Branch disposition:** Deleted | Retained as reference | Retained for follow-up | Unknown
- **Follow-up owner/location:** Link, or None.
```

If a closure reason cannot be established from evidence, explicitly say so. Do not infer intent from a green check, age, lack of comments, or mergeability state.

## Failure and incident notes

Add a note to [Development Lessons](DEVELOPMENT_LESSONS.md) when a failure is recurring, high-impact, or reveals a missing safeguard. Include:

- Symptom and impact.
- Exact failing PR/commit/Actions run and relevant job/step.
- Verified root cause; if not established, label it **Unknown** or **Suspected**.
- Corrective change and linked PR/commit.
- Regression test or repeatable verification.
- Remaining limitation and review date.

Distinguish source/test failures from infrastructure, deployment, permissions, cancellation, and transient provider failures. Do not describe a retry as a fix unless the underlying cause is understood. Keep raw logs in GitHub Actions; retain a short diagnosis and stable link.

## Record maintenance

- Update the existing owning record instead of creating overlapping documents.
- Preserve history when decisions change: supersede and link rather than silently rewriting an accepted ADR.
- Never record secrets, tokens, personal credentials, device identifiers, or unrelated personal data.
- Do not duplicate GitHub metadata (full commit lists, every CI log line, branch inventories) in prose when GitHub already provides a stable record. Create a dedicated ledger only when GitHub data may be ephemeral or difficult to reconstruct, as with the branch deletion report.
- Review records when a related failure recurs or the implementation materially changes; do not add periodic bureaucracy without a concrete need.

## Related references

- [Pull Request Workflow](PULL_REQUEST_WORKFLOW.md)
- [Development Lessons and Reliability Guardrails](DEVELOPMENT_LESSONS.md)
- [AI Working Rules](AI_WORKING_RULES.md)

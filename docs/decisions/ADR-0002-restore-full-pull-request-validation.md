# ADR-0002: Restore full pull-request validation

- **Status:** Accepted
- **Date:** 2026-11-18
- **Decision:** Direct user request, implemented in this PR
- **Supersedes:** [ADR-0001: Cost-controlled workflow validation](ADR-0001-ci-cost-controlled-workflow-validation.md)

## Context

The cost-reduction changes in PR #174 skipped web and Android validation on draft PRs and removed the standalone simulation audit and file-deletion safeguard. The repository is public, so standard GitHub-hosted runners used by its public-repository workflows are free. The account's included private-repository allowance is not a reason to weaken validation in this public repository.

## Decision

1. Run the applicable web and Android validation workflows on every PR update, including draft PRs.
2. Keep web validation complete: dependency installation, Svelte checks, regular Vitest tests, and production build.
3. Restore the separate long simulation audit workflow. It runs automatically for its relevant simulation/library/package paths and remains manually dispatchable.
4. Restore the PR file-deletion safeguard and require the explicit reviewed-deletions checklist item when tracked files are deleted.
5. Restore the Android workflow artifact retention to 14 days, reversing the one-day reduction introduced by PR #174.
6. Preserve path filters, concurrency cancellation, caching, least-privilege permissions, production Pages deployment, Android signing verification, and the separate beta publishing job.
7. Do not skip required validation solely to reduce runner usage. Optimize CI only when it improves speed, reliability, or maintainability without reducing meaningful coverage.

## Consequences

- Draft PR updates receive the same applicable web and Android checks as other PR updates.
- Relevant simulation changes receive a separate long-running simulation audit.
- Tracked file deletions are gated by explicit review confirmation.
- Some draft iterations produce more workflow runs, but this public repository's standard hosted-runner minutes are free.
- The Android build artifact remains available for 14 days; the GitHub beta release remains the durable distribution channel.
- The beta APK updater, signing improvements, release versioning, and deployment behavior remain unchanged.

## References

- [PR #174](https://github.com/MasfikurDev/My-Life-Simulator/pull/174)
- [CI and Delivery](../CI_CD.md)
- [Pull Request Workflow](../PULL_REQUEST_WORKFLOW.md)

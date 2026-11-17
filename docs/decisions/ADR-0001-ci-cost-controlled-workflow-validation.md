# ADR-0001: Cost-controlled workflow validation

- **Status:** Superseded by [ADR-0002: Restore full pull-request validation](ADR-0002-restore-full-pull-request-validation.md)
- **Date:** 2026-11-18
- **Decision owners / approval:** Direct user request, implemented in [PR #174](https://github.com/MasfikurDev/My-Life-Simulator/pull/174)
- **Supersedes:** None
- **Superseded by:** [ADR-0002: Restore full pull-request validation](ADR-0002-restore-full-pull-request-validation.md)

## Context

GitHub Actions usage is a meaningful project cost. The repository's user-provided Actions metrics showed 1,128 runner minutes and 1,039 job runs over the displayed historical date range. The largest recorded consumers were web validation (698 minutes / 672 runs), the PR deletion safeguard (162 minutes / 157 runs), Android builds (60 minutes / 48 runs), and the standalone simulation audit (34 minutes / 34 runs).

Those figures identify where work accumulated, but they do not reveal how many web or Android runs belonged to draft PRs. Therefore, this decision does not promise a specific percentage or dollar saving. It targets repeat work and avoids spending hosted-runner minutes on every intermediate draft commit.

## Decision

1. Keep CI event-driven and path-filtered. Web-only changes must not trigger Android builds; Android-only changes must not trigger web validation or deployment.
2. Skip expensive web and Android validation while a PR is a draft. Trigger the full applicable workflow when the PR becomes ready for review, on subsequent commits, and on main pushes. Converting a PR back to draft cancels in-progress validation.
3. Keep web Svelte checking and the regular Vitest suite in parallel, followed by the production build.
4. Run the long simulation stress suite inside the web validation job only when `web/src/lib/**`, the web package/lockfile, or the web workflow changes. Manual dispatch of `web.yml` runs the suite explicitly.
5. Remove the standalone PR deletion guard and its script. Deleted and renamed files remain part of the required full-diff review and PR checklist, but deletion-specific checkbox enforcement is no longer an automated status check.
6. Remove the standalone simulation audit workflow. Preserve the `test:simulation` command and its scenario coverage.
7. Keep Android build and beta publication as separate jobs. Inject persistent signing secrets only into the signing-preparation step for non-PR runs on `main`; do not expose those values to Gradle.
8. Retain the APK artifact for one day because the publish job consumes it immediately. The published GitHub Release APK remains the durable distribution artifact.
9. Preserve GitHub Pages deployment on successful `main` validation, beta release publication, concurrency cancellation, existing dependency/build caches, least-privilege permissions, and manual workflow dispatch.

## Consequences

- Intermediate draft commits no longer each consume a full hosted validation run.
- The simulation suite shares the web job's checkout and dependency installation instead of starting a second workflow/job.
- Two standalone workflows and the deletion-only script are removed; the workflow directory has two active workflows.
- Deletion review becomes a human PR-review responsibility. Reviewers must inspect the complete diff and explicitly account for intentional removals.
- The long simulation suite does not run for unrelated web UI changes; it runs for the defined simulation/library/package/workflow paths or by manual dispatch.
- APK workflow artifacts are available for a shorter period. Beta release assets are unaffected.
- Savings depend on future PR activity and changed-file mix; measure actual runner minutes after rollout rather than extrapolating an unverified percentage.

## Alternatives considered

- **Run full CI on every draft update:** rejected because it spends hosted minutes on intermediate work before the PR is ready for review.
- **Remove the simulation stress suite entirely:** rejected because its multi-week determinism and settlement coverage remains valuable.
- **Keep both standalone workflows:** rejected because the deletion-only check and separate simulation setup add overhead; the latter can reuse the existing web job's dependencies.
- **Remove all automated validation from PRs:** rejected. Full validation remains required when a PR becomes ready and on relevant main pushes.

## References

- [PR #174](https://github.com/MasfikurDev/My-Life-Simulator/pull/174)
- [CI and Delivery](../CI_CD.md)
- [Pull Request Workflow](../PULL_REQUEST_WORKFLOW.md)

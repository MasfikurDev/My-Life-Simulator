# CI and Delivery

**Operational reference · Reviewed 2026-11-18**

## Delivery model

- The web client lives in `web/` and is deployed to **GitHub Pages**.
- The Android wrapper lives in `android/` and loads the published web client in a Kotlin WebView.
- GitHub Actions is the CI/CD system. Cloudflare Workers/Pages deployment automation is not part of the active delivery path.
- Web-only changes do not require rebuilding or reinstalling the APK; the wrapper receives the latest published web app on a fresh launch.
- Android wrapper/workflow changes trigger an Android APK build.

## Web validation and deployment

Workflow: `.github/workflows/web.yml`

- Triggers for web changes and workflow changes on PRs and pushes to `main`; manual dispatch remains available.
- Draft PRs skip the validation job. Becoming ready for review triggers the full validation; subsequent commits validate normally. Converting a PR back to draft cancels an in-progress run.
- Uses Node.js 22, locked dependencies via `npm ci`, and the existing npm cache.
- Runs Svelte checking and the regular Vitest suite concurrently, then runs the production build.
- Runs `npm run test:simulation` in the same job only when `web/src/lib/**`, the web package/lockfile, or the web workflow changes. Manual dispatch runs the long suite.
- The simulation stress suite is still a separate test command, but no longer a separate workflow or dependency installation.
- Uploads the Pages artifact only outside pull-request runs and deploys to GitHub Pages only from `main`, after validation succeeds.
- Validation has read-only repository permissions. Pages write and OIDC permissions remain isolated to the deployment job.
- Concurrency cancels obsolete runs for the same PR/ref.
- Commands: `npm run check`, `npm test`, conditional `npm run test:simulation -- --reporter=dot`, and `npm run build:app`.

## Removed standalone workflows

- `.github/workflows/pr-guardrails.yml` was removed. File deletions are reviewed through the mandatory full-diff PR checklist and normal code review; deletion-specific checkbox enforcement is no longer an automated status check.
- `.github/workflows/simulation-audit.yml` was removed. Its long simulation test remains in `web/package.json` and is invoked conditionally by `web.yml`.
- The now-unreferenced `.github/scripts/check-pr-deletions.sh` was removed.
- This consolidation intentionally removes two workflow runs/status checks and one independent deletion-only job. It does not remove the simulation stress tests or ordinary PR diff review.

## Android APK and beta publishing

Workflow: `.github/workflows/android.yml`

- Android-only path filters remain; web-only changes do not build an APK.
- Draft PRs skip Android builds. Ready-for-review transitions and subsequent commits build normally.
- Uses Java 17 and Gradle 8.11.1 with the existing Gradle cache/build cache.
- The build job remains read-only. Persistent signing secrets are available only to the signing-preparation step and the single Gradle assemble step, and only for non-PR runs on `main`; unrelated steps never receive the secret values.
- The signing-preparation step validates the keystore and extracts its certificate SHA-256 fingerprint. Gradle receives the keystore path, password, alias, and key password for the assemble step so `persistentDebug` is actually selected.
- APK verification checks both cryptographic validity and that the APK signer fingerprint exactly matches the certificate extracted from the persistent keystore. A main-branch push fails if secrets are missing, the keystore is invalid, or the built APK uses any other signing identity. Manual dispatch on `main` also exercises signing verification without publishing a release.
- The APK artifact is retained for one day because the publish job consumes it immediately. The beta release asset remains the durable download.
- The separate publish job runs only on a push to `main`, downloads the exact APK artifact from that run, and receives `contents: write`.
- **Beta version numbers are release-based, not workflow-run-based.** On a main push, the build reads existing published beta pre-releases with `beta-<version>-<attempt>` tags and assigns the next version number. The successful release uses that number for its APK `versionCode`, `versionName`, release title, and tag.
- PR validation and manual workflow runs use a non-release version and do not upload a beta APK artifact. They therefore cannot consume a beta version number or produce an APK that could be mistaken for an installable beta upgrade.
- The build reads published release metadata with its existing `contents: read` permission; only the separate publish job receives `contents: write`.
- The existing single-build artifact hand-off remains in place. No second APK build is introduced for publishing.

## CI cost and safety rules

Durable rationale and trade-offs are recorded in [ADR-0001: Cost-controlled workflow validation](decisions/ADR-0001-ci-cost-controlled-workflow-validation.md).

- Keep path filters so web-only changes do not trigger Android builds and Android-only changes do not trigger web validation/deployment.
- Skip expensive work on draft PRs, but always validate when a PR becomes ready for review.
- Keep Svelte checks, unit tests, and production build on every applicable non-draft web PR and main push.
- Run the long simulation suite only for relevant simulation/library/package/workflow changes or explicit manual dispatch.
- Preserve concurrency cancellation, npm/Gradle caches, least-privilege permissions, and single-build artifact hand-off.
- Do not restore Cloudflare CI, Wrangler jobs, scheduled polling, or redundant deployment targets without an explicit product decision.
- Never report checks or deployment as successful until the exact GitHub Actions run confirms it.

## Android update behavior

The APK is a lightweight wrapper. A fresh app launch clears the WebView disk cache, then normal HTTP caching is allowed during the session. The web client does not register a service worker. Keep this freshness behavior aligned with [Technical Architecture](TECHNICAL_ARCHITECTURE.md).

## Provisional beta APK updater

The native Android module contains a beta-only APK download and installation flow documented in [Beta APK updater](BETA_APK_UPDATER.md). It is deliberately provisional for active development and does not define stable-release behavior.

The Android app module reads the `appVersionCode` and `appVersionName` Gradle properties, validates that the version code is a positive integer, and retains local-build defaults when no properties are supplied. For a main-branch beta build, the workflow derives the next version code from existing published beta pre-releases, then supplies that release version to Gradle. PR and manual validation builds use a non-release version and do not publish an APK artifact. Workflow run numbers and PR activity no longer affect beta numbering.

The downloader uses Android DownloadManager for its system-managed progress notification, verifies the downloaded APK checksum, package ID, version code and signing identity, then hands it to Android's package installer. The notification transport is not wired into this change; the documented intent contract is the integration boundary for a future beta-only notification provider.

Updater cleanup is limited to updater-owned artifacts: failed/invalid downloads are removed, verified APKs remain available while the installer may need them, and the APK plus updater metadata are removed after package replacement or when stale for seven days. Startup cleanup also removes orphaned updater APKs. Game saves, settings, WebView data and unrelated app storage are never included in this cleanup. The parallel/segmented downloader and notification transport remain deferred, replaceable beta-development work.

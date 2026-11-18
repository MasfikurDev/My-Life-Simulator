# CI and Delivery

**Operational reference · Reviewed 2026-11-18**

## Delivery model

- The web client lives in `web/` and is deployed to **GitHub Pages**.
- The Android wrapper lives in `android/` and loads the published web client in a Kotlin WebView.
- GitHub Actions is the CI/CD system. Cloudflare Workers/Pages deployment automation is not part of the active delivery path.
- Web-only changes do not require rebuilding or reinstalling the APK; the wrapper receives the latest published web app on a fresh launch.
- Android wrapper/workflow changes trigger an Android APK build.

## Web workflow

Workflow: `.github/workflows/web.yml`

- Triggers on pull requests and pushes to `main` when `web/**` or the workflow itself changes; also supports manual dispatch.
- Every applicable PR update is validated, including draft PRs. Becoming ready for review also triggers validation.
- Uses `actions/checkout@v7` and `actions/setup-node@v7`; the project runtime remains Node.js 22 and dependencies are installed from the lockfile via `npm ci`.
- Runs Svelte checks and the regular Vitest regression suite concurrently, then builds the production site.
- Uploads the Pages artifact outside pull-request runs.
- Deploys to GitHub Pages only from `main`, after validation succeeds.
- Uses read-only repository contents permission, scoped Pages deployment permissions, path filters, and concurrency cancellation.
- Web build command is `npm run build:app`; validation commands are `npm run check` and `npm test`.

## Pull request safeguards

Workflow: `.github/workflows/pr-guardrails.yml`

- Runs on every pull request open, update, reopen, ready-for-review transition, and edit; it is independent of web/Android path filters.
- Checks the full base-to-head diff for deleted tracked files.
- A PR that deletes tracked files fails this guard unless its body contains the checked `Intentional file deletions reviewed` checklist item. Check it only after reviewing the removed behavior, tests, and documentation. Renames detected by Git are not treated as deletions.
- The repository PR template requires scope/preservation review, focused regression tests, cross-domain validation, simulation audit where relevant, UI verification, documentation, and disclosure of intentional removals.
- The guard does not decide whether a code-level behavior removal inside an edited file is safe. Full diff review and regression tests remain required.

## Long simulation audit

Workflow: `.github/workflows/simulation-audit.yml`

- The dedicated `test:simulation` command runs the deterministic long-running scenarios in `web/src/lib/simulation-stress.test.ts`.
- The suite covers 52-week runs, deterministic replay, annual settlement, birthday/life-stage transition, age-diverse stat and cash bounds, and a planned action through the normal weekly resolver.
- It runs automatically on PRs that change `web/src/lib/**`, the web package scripts/lockfile, or the audit workflow itself; manual dispatch is available for the exact branch/commit.
- The workflow checks out the exact PR head commit for pull-request runs. Its default manual ref is `main`.
- A green long-simulation result is evidence for these scenarios only; it does not replace focused tests for the changed mechanic or broader integration review.

## Android APK and beta publishing

Workflow: `.github/workflows/android.yml`

- Android-only path filters remain; web-only changes do not build an APK.
- Every applicable Android PR update is built and validated, including draft PRs.
- Uses `actions/checkout@v7`, `actions/setup-java@v6` with Java 17, and `gradle/actions/setup-gradle@v6` with its open-source `basic` cache provider and Gradle 8.11.1.
- The build job remains read-only. Persistent signing secrets are available only to the signing-preparation step and the single Gradle assemble step, and only for non-PR runs on `main`; unrelated steps never receive the secret values.
- Pull-request builds generate a throwaway CI keystore (no repository secrets) and pass its credentials to Gradle. This exercises the same `persistentDebug` signing path and signer verification without exposing the release key.
- The signing-preparation step validates the selected keystore and extracts its certificate SHA-256 fingerprint. Gradle receives the keystore path, password, alias, and key password for the assemble step so `persistentDebug` is actually selected.
- APK verification checks both cryptographic validity and that the APK signer fingerprint exactly matches the certificate extracted from the selected keystore. A main-branch push fails if persistent secrets are missing, the keystore is invalid, or the built APK uses any other signing identity. Manual dispatch on `main` also exercises persistent signing verification without publishing a release.
- Treat the four persistent signing secrets as one immutable release identity. Rotating or replacing the keystore is an Android package-signing migration, not routine secret maintenance; verify the installed release certificate and plan an explicit user-data-preserving migration before changing it.
- The versioned APK workflow artifact is retained for 14 days for convenient recovery and inspection. The GitHub Release asset remains the durable download.
- The separate publish job runs only on a push to `main`, downloads the exact APK artifact from that run, and receives `contents: write`.
- **Beta version numbers are release-based, not workflow-run-based.** On a main push, the build reads published beta prerelease tags in both the historical `beta-<number>-<attempt>` format and the current `v0.1.<number>-beta` format, then assigns the next number. The new release uses that number consistently for Android `versionCode`, Android `versionName` (`0.1.<number>-beta` after the Gradle suffix), Git tag (`v0.1.<number>-beta`), GitHub release title, APK filename, and artifact name.
- PR validation and manual workflow runs use a non-release version and do not upload a beta APK artifact. They therefore cannot consume a beta version number or produce an APK that could be mistaken for an installable beta upgrade.
- The build reads published release metadata with its existing `contents: read` permission; only the separate publish job receives `contents: write`.
- The existing single-build artifact hand-off remains in place. No second APK build is introduced for publishing.

## Action runtime maintenance

- Use the current supported major versions of first-party actions: checkout v7, setup-node v7, setup-java v6, upload/download-artifact v7, and deploy-pages v5.
- Keep the GitHub Pages artifact action at v3, the current documented integration for Pages artifact packaging.
- Gradle setup uses v6 with `cache-provider: basic`, retaining the open-source GitHub Actions cache rather than opting into the enhanced commercial cache provider.
- Review action major versions periodically, but validate upgrades through the normal PR workflows before merging.

## CI cost and safety rules

The validation policy is to run the full applicable checks on PR updates, including drafts. Public-repository standard GitHub-hosted runners do not create a reason to skip validation.

- Keep path filters so web-only changes do not trigger Android builds and Android-only changes do not trigger web validation/deployment.
- Run Svelte checks, unit tests, and the production build on every applicable web PR update and main push, including draft PRs.
- Run the separate long simulation audit automatically for its relevant paths and by manual dispatch.
- Keep the PR deletion safeguard active; deletions require the explicit reviewed checklist item.
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

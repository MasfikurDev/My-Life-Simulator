# CI and Delivery

**Operational reference · Reviewed 2026-11-10**

## Delivery model

- The web client lives in `web/` and is deployed to **GitHub Pages**.
- The Android wrapper lives in `android/` and loads the published web client in a Kotlin WebView.
- GitHub Actions is the CI/CD system. Cloudflare Workers/Pages deployment automation is not part of the active delivery path.
- Web-only changes do not require rebuilding or reinstalling the APK; the wrapper receives the latest published web app on a fresh launch.
- Android wrapper/workflow changes trigger an Android APK build.

## Web workflow

Workflow: `.github/workflows/web.yml`

- Triggers on pull requests and pushes to `main` when `web/**` or the workflow itself changes; also supports manual dispatch.
- Uses Node.js 22 and locked dependencies via `npm ci`.
- Runs Svelte checks and Vitest concurrently, then builds the production site.
- Uploads the Pages artifact outside pull-request runs.
- Deploys to GitHub Pages only from `main`, after validation succeeds.
- Uses read-only repository contents permission, scoped Pages deployment permissions, path filters, and concurrency cancellation.
- Web build command is `npm run build:app`; validation commands are `npm run check` and `npm test`.

## Android workflow

Workflow: `.github/workflows/android.yml`

The intended hardened workflow separates building from publishing:

1. **Build job:** read-only `contents: read`; checkout, Java 17, Gradle 8.11.1, assemble the debug APK, and upload `my-life-simulator-debug-apk` for 14 days.
2. **Publish job:** runs only for a push to `main`, depends on successful build, downloads that exact artifact, and publishes the beta pre-release. Only this job receives `contents: write`.
3. Pull requests and manual builds can produce the APK artifact but cannot publish a release.

The build command is `gradle --no-daemon --build-cache --parallel --console=plain assembleDebug`. The beta tag format is `beta-<run_number>-<run_attempt>`.

**Rollout status:** this hardened split is proposed in [PR #111](https://github.com/MasfikurDev/My-Life-Simulator/pull/111). Treat it as pending until the PR is merged. The main-branch workflow remains the operational source of truth until then.

## CI change rules

- Preserve path filters so web-only changes do not trigger Android builds and Android-only changes do not trigger web deployment.
- Keep repository permissions least-privilege. Grant write permissions only to the release job that needs them.
- Release publication must depend on a successful APK build and must use the artifact produced by that run, not rebuild a second time.
- Do not restore Cloudflare deployment jobs, Wrangler steps, or redundant deployment targets without an explicit product decision.
- Avoid unnecessary CI parallelism or duplicated builds. Prefer one validation/build pass and artifact hand-off between jobs.
- Never describe a workflow as passing until the corresponding GitHub Actions run is confirmed green.

## Android update behavior

The APK is a lightweight wrapper. A fresh app launch clears the WebView disk cache, then normal HTTP caching is allowed during the session. The web client does not register a service worker. Keep this freshness behavior aligned with [Technical Architecture](TECHNICAL_ARCHITECTURE.md).

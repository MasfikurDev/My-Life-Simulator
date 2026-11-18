# Android beta build and release

## Build types

| Variant | Purpose | Application ID | Debuggable | Optimization |
|---|---|---|---|---|
| `debug` | Developer builds | `com.masfikurdev.mylifesimulator.dev` | Yes | No minification |
| `beta` | Installed beta testing | `com.masfikurdev.mylifesimulator.debug` | No | Release minification |
| `release` | Future production distribution | `com.masfikurdev.mylifesimulator` | No | Release minification |

The beta variant inherits the release build configuration, including R8 minification, while retaining the existing beta application ID and persistent signing identity. This allows users with an existing beta installation to install subsequent beta releases as in-place updates without losing app data.

The developer variant uses a separate `.dev` application ID and the normal local debug key. It can coexist with the beta app and cannot accidentally replace it.

## Signing and WebView bridge

- GitHub pull-request builds create a short-lived CI keystore, build the beta variant, and verify that the APK certificate matches that keystore.
- A push to `main` must use the repository's persistent Android signing secrets. Publishing fails if the persistent keystore or its certificate verification is unavailable.
- Local beta builds fall back to the local Android debug key. They are for local testing only and cannot update the published beta.
- Beta is not debuggable, so `BuildConfig.DEBUG` disables WebView remote debugging in the beta APK.
- The ProGuard rules preserve methods annotated with `@JavascriptInterface` on `MainActivity.GameBridge`. This is required because beta uses R8 minification.

## Public release naming

Use one consistent, versioned naming scheme for every published beta:

| Release element | Convention | Example |
|---|---|---|
| Android version name | `MAJOR.MINOR.PATCH-beta` | `0.1.75-beta` |
| Git tag | `vMAJOR.MINOR.PATCH-beta` | `v0.1.75-beta` |
| GitHub release title | `My Life Simulator vMAJOR.MINOR.PATCH-beta` | `My Life Simulator v0.1.75-beta` |
| APK asset | `My-Life-Simulator-vMAJOR.MINOR.PATCH-beta.apk` | `My-Life-Simulator-v0.1.75-beta.apk` |

The `v` prefix belongs on Git tags, not Android's `versionName`. The `-beta` suffix identifies the prerelease channel. GitHub releases are marked as prereleases and generated release notes summarize merged changes since the previous release.

Android `versionCode` remains a positive, strictly increasing integer. It is independent from the human-readable version string and is used by Android to determine whether an APK can update an installed app.

The release counter remains continuous during the naming transition: the workflow reads both legacy `beta-<number>-<attempt>` tags and new `v0.1.<number>-beta` tags. Existing tags and published releases are not renamed or rewritten.

## GitHub Actions behavior

The workflows use current supported first-party action majors: checkout v7, setup-java v6, setup-node v7, Gradle setup v6, upload/download-artifact v7, and deploy-pages v5. Gradle setup explicitly uses the open-source `basic` cache provider.

- Pull requests affecting `android/**` or this workflow compile both `assembleDebug` and `assembleBeta`; they do not publish a release.
- A successful push to `main` builds and verifies `assembleBeta`, uploads the versioned APK artifact (retained for 3 days as a short-lived build-to-publish hand-off), and publishes a GitHub prerelease.
- The published APK uses the exact same version string as the Git tag and release title.
- Manual workflow runs do not publish beta releases, upload public beta artifacts, or consume release numbers.
- Generated release notes are retained; historical releases are not retroactively renamed.

## Compatibility requirements

Do not change the beta application ID, persistent signing key, or beta package's signing certificate without an explicit migration plan. Doing so would prevent Android from applying updates over existing beta installations. Keep the beta version code increasing for every published release.

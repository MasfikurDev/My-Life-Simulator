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

## GitHub Actions behavior

- Pull requests affecting `android/**` or this workflow compile both `assembleDebug` and `assembleBeta`; they do not publish a release.
- A successful push to `main` builds and verifies `assembleBeta`, uploads the clearly named beta APK, and publishes a GitHub pre-release.
- Version codes continue from the highest published `beta-<version>-<run-attempt>` tag. PR and manual validation builds do not consume release numbers.
- Manual workflow runs do not publish beta releases.
- The published asset is named `My-Life-Simulator-Beta-<version>.apk`.

## Compatibility requirements

Do not change the beta application ID, persistent signing key, or beta package's signing certificate without an explicit migration plan. Doing so would prevent Android from applying updates over existing beta installations. Keep the beta version code increasing for every published release.

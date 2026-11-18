# Legacy Android Release Archive

This page groups historical Android beta releases for reference without changing their original Git tags, APK files, checksums, or release history.

**Current downloads:** Use the [GitHub Releases page](https://github.com/MasfikurDev/My-Life-Simulator/releases) and select the newest versioned beta release (currently using the `v0.1.N-beta` format). The archive below is for older releases, not the recommended installation path.

## Historical releases

These releases are currently marked `[LEGACY]` on GitHub:

| Release | Original Git tag | Release |
|---|---|---|
| Beta 72 | `beta-72-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-72-1) |
| Beta 71 | `beta-71-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-71-1) |
| Beta 45 | `beta-45-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-45-1) |
| Beta 43 | `beta-43-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-43-1) |
| Beta 41 | `beta-41-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-41-1) |
| Beta 39 | `beta-39-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-39-1) |
| Beta 37 | `beta-37-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-37-1) |
| Beta 29 | `beta-29-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-29-1) |
| Beta 27 | `beta-27-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-27-1) |
| Beta 25 | `beta-25-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-25-1) |
| Beta 23 | `beta-23-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-23-1) |
| Beta 21 | `beta-21-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-21-1) |
| Beta 19 | `beta-19-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-19-1) |
| Beta 16 | `beta-16-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-16-1) |
| Beta 14 | `beta-14-1` | [Open release](https://github.com/MasfikurDev/My-Life-Simulator/releases/tag/beta-14-1) |

## Compatibility notes

The `[LEGACY]` label identifies historical releases from the earlier release process; it does **not**, by itself, prove that an APK is unsigned or incompatible with every later build.

- Beta 71 and Beta 72 have confirmed different signing certificates. Android may reject one as an update over the other.
- Beta 43 is included here as a historical release, but its signing certificate has not been verified in this archive. Do not assume it is incompatible solely because it is listed here.
- For any older APK, Android update compatibility depends on the APK's actual signing certificate and package identity. A filename such as `app-debug.apk` is not sufficient evidence of its certificate.
- If Android refuses an update, preserve/export game data before uninstalling. Uninstalling may erase locally stored saves.

Do not rename historical Git tags, replace historical APK assets, or rebuild/re-sign old releases just to organize this archive. The original GitHub release remains the source for each historical binary.

## Release policy going forward

- New beta releases use `vMAJOR.MINOR.PATCH-beta` tags, matching release titles and APK filenames.
- Current beta releases remain the primary download path on GitHub Releases.
- This document is an index only; it does not duplicate APK binaries or replace GitHub's release history.

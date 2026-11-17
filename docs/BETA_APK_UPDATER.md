# Beta APK updater (provisional)

**Scope:** active beta testing and development only. This is not a finalized stable-release update architecture. The notification transport and download engine may be replaced after beta evaluation.

## Current implementation

The Android module owns APK download and installation. The game WebView does not download or install APKs.

1. A trusted update source supplies version, release URL, APK URL, SHA-256 and changelog metadata.
2. The app validates that the metadata points to the official `MasfikurDev/My-Life-Simulator` GitHub release and that the version is newer.
3. Android DownloadManager downloads the APK into app-specific external storage and provides system-managed download progress.
4. On completion, the app verifies the SHA-256, package ID, version code and APK signing certificate against the currently installed app.
5. Only a verified APK can be handed to Android's package installer through FileProvider.
6. Android may require the user to enable “Allow from this source” for My Life Simulator and always retains final installation confirmation.

The downloader does not overwrite the installed APK. A failed, incomplete or invalid download is rejected and its updater-owned temporary APK and DownloadManager record are removed.

## Temporary-file and data-cleanup policy

The updater owns exactly one APK file, `mls-beta-update.apk`, in the app-specific downloads directory, plus its DownloadManager record and a small set of updater preferences.

- Starting a replacement download removes the previous updater-owned download and APK first.
- Failed, cancelled, incomplete or checksum/signature-invalid downloads are removed.
- A verified APK is retained while Android's installer may still need to read it. It is not deleted immediately after launching the installer.
- After Android reports `MY_PACKAGE_REPLACED`, the updater removes the old APK, DownloadManager record and updater metadata.
- If installation is cancelled or interrupted, the verified APK can be retried. It is removed as stale after seven days.
- On app startup, orphaned APKs without matching updater metadata are removed; stale metadata/downloads are also reconciled.
- Cleanup never deletes game saves, settings, WebView data, or unrelated app files. It does not clear all app data or uninstall anything.

## Integration contract

The future beta notification receiver can open the app with action
`com.masfikurdev.mylifesimulator.BETA_UPDATE_AVAILABLE` and extras:

- `beta.versionName`
- `beta.versionCode`
- `beta.releaseUrl`
- `beta.apkUrl`
- `beta.sha256`
- `beta.changelog`

The app must resolve/verify the referenced release against GitHub before calling `BetaApkUpdater.enqueue`. Do not trust the notification payload alone. Do not put tokens, signing keys or personal data in notification messages.

## Deferred, replaceable work

These items are deliberately not required for the first safe beta updater:

- **Segmented/parallel downloader:** DownloadManager is currently used for compatibility and system-managed behavior. An aria2-inspired Kotlin engine with parallel byte ranges, resumable chunks and per-chunk retries can replace the transfer layer later. It must verify server range support and consistent asset validators, fall back to a single stream when unsupported, and be benchmarked before claiming a speed improvement. The download/verification/install boundary should remain unchanged.
- **Notification transport:** ntfy (including a random topic) is only a provisional beta-development option. It is not wired into this PR and is not a stable-release decision. FCM is not included.
- **In-app pause/resume and detailed speed controls:** not provided by DownloadManager; do not display controls that the current engine cannot honor.

## Known rollout constraints

- The installed beta package ID is `com.masfikurdev.mylifesimulator.debug`; the published artifact remains `app-debug.apk`.
- Updates require the exact persistent signing identity and a strictly higher Android versionCode.
- Earlier beta builds may have been signed with ephemeral runner debug keys. Do not uninstall the current beta or attempt an in-place update until the current installed certificate and save export/import safety have been checked.
- The updater is not considered device-validated until a real installation, cancellation, failed-download cleanup and post-update cleanup are tested on the target Android device.

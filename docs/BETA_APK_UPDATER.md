# Beta APK updater (provisional)

**Scope:** active beta testing and development only. This is not a finalized stable-release update architecture. The notification transport may be replaced or removed after the beta evaluation.

## Current implementation

The Android module owns APK download and installation. The game WebView does not download or install APKs.

1. A trusted update source supplies version, release URL, APK URL, SHA-256 and changelog metadata.
2. The app validates that the metadata points to the official `MasfikurDev/My-Life-Simulator` GitHub release and that the version is newer.
3. Android DownloadManager downloads the APK into app-specific external storage and shows the system download progress/notification.
4. On completion, the app verifies the SHA-256, package ID and APK signing certificate against the currently installed app.
5. Only a verified APK can be handed to Android's package installer through FileProvider.
6. Android may require the user to enable “Allow from this source” for My Life Simulator and always retains final installation confirmation.

The downloader does not overwrite the installed APK. A failed, incomplete or invalid download is not installed.

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

## Known rollout constraints

- The installed beta package ID is `com.masfikurdev.mylifesimulator.debug`; the published artifact remains `app-debug.apk`.
- Updates require the exact persistent signing identity and a strictly higher Android versionCode.
- Earlier beta builds may have been signed with ephemeral runner debug keys. Do not uninstall the current beta or attempt an in-place update until the current installed certificate and save export/import safety have been checked.
- The notification transport discussed for beta development (public ntfy with a random topic) remains provisional and is not implemented as a stable-release commitment.
- DownloadManager supplies system-managed download progress and retry behavior. It does not expose app-controlled pause/resume controls; those are intentionally not simulated.
- The downloader is only useful once a trusted update event is connected to the update prompt. Notification delivery is a separate integration step.

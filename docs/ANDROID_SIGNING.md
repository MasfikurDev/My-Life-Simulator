# Android beta APK signing

The Android beta artifact is the existing **debug build variant**, with application ID
`com.masfikurdev.mylifesimulator.debug`. Keep that application ID and continue publishing
`app-debug.apk`; switching beta releases to the release variant would create a different
application ID and prevent in-place updates.

## Persistent signing identity

Main-branch beta APKs must be signed with one persistent keystore. Configure these repository
secrets under **Settings → Secrets and variables → Actions**:

- `ANDROID_KEYSTORE_BASE64`: single-line Base64 encoding of the JKS file
- `ANDROID_KEYSTORE_PASSWORD`: keystore password
- `ANDROID_KEY_ALIAS`: key alias
- `ANDROID_KEY_PASSWORD`: key password

The workflow decodes the keystore into the runner's temporary directory, validates the alias,
and signs the debug variant. It verifies the resulting APK signature before uploading the
artifact for beta publication. The keystore and passwords must never be committed or printed.

A main-branch Android build fails rather than publishing an APK if the signing secrets are
missing or invalid. Pull-request validation can still build with Android's temporary debug key
when secrets are unavailable. Local builds also retain the normal Android debug-signing
fallback when the environment variables are absent.

## Update compatibility and data safety

The previously published beta APKs were signed using runner-generated debug keys. Those keys
are not a stable signing identity, so the first APK signed with this persistent keystore may
not install over an older beta. **Do not uninstall the currently installed beta until the
game's complete save data has been exported and verified restorable.**

A plain gameplay/debug snapshot is not necessarily a full save backup. Confirm that the
current game provides a complete, validated save export/import path before attempting the
one-time signing transition. Preserve the JKS file and a secure backup of it: future updates
must use this exact signing identity.

## Build scope

The existing path filters remain unchanged. Changes limited to `web/**` or `docs/**` do not
trigger the Android APK workflow. Android wrapper or Android workflow changes do.

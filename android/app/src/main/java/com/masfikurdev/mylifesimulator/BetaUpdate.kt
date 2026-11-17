package com.masfikurdev.mylifesimulator

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.provider.Settings
import androidx.core.content.FileProvider
import java.io.File
import java.security.MessageDigest

/**
 * Beta-only APK download and installation helpers.
 *
 * Update metadata must come from the trusted GitHub release lookup, not directly
 * from an untrusted notification payload. The notification transport is
 * deliberately kept separate so it can be replaced during beta development.
 */
data class BetaUpdate(
    val versionName: String,
    val versionCode: Long,
    val releaseUrl: String,
    val apkUrl: String,
    val sha256: String,
    val changelog: String = ""
) {
    fun isValid(): Boolean {
        val release = Uri.parse(releaseUrl)
        val apk = Uri.parse(apkUrl)
        return versionName.isNotBlank() &&
            versionCode > 0 &&
            release.scheme == "https" && release.host == "github.com" &&
            release.pathSegments.take(2) == listOf("MasfikurDev", "My-Life-Simulator") &&
            apk.scheme == "https" && apk.host == "github.com" &&
            apk.pathSegments.take(2) == listOf("MasfikurDev", "My-Life-Simulator") &&
            apk.pathSegments.contains("releases") &&
            sha256.matches(Regex("(?i)^[a-f0-9]{64}$"))
    }
}

object BetaApkUpdater {
    const val ACTION_UPDATE_AVAILABLE = "com.masfikurdev.mylifesimulator.BETA_UPDATE_AVAILABLE"
    const val ACTION_INSTALL_VERIFIED = "com.masfikurdev.mylifesimulator.INSTALL_VERIFIED_APK"
    const val EXTRA_VERSION_NAME = "beta.versionName"
    const val EXTRA_VERSION_CODE = "beta.versionCode"
    const val EXTRA_RELEASE_URL = "beta.releaseUrl"
    const val EXTRA_APK_URL = "beta.apkUrl"
    const val EXTRA_SHA256 = "beta.sha256"
    const val EXTRA_CHANGELOG = "beta.changelog"

    private const val PREFS = "beta_apk_updater"
    private const val KEY_DOWNLOAD_ID = "download_id"
    private const val KEY_EXPECTED_SHA = "expected_sha256"
    private const val KEY_VERSION_NAME = "version_name"
    private const val KEY_VERSION_CODE = "version_code"
    private const val KEY_CREATED_AT = "created_at"
    private const val APK_NAME = "mls-beta-update.apk"
    private const val STALE_AFTER_MS = 7L * 24 * 60 * 60 * 1000

    fun enqueue(context: Context, update: BetaUpdate): Long {
        require(update.isValid()) { "Invalid beta release metadata" }
        require(update.versionCode > installedVersionCode(context)) {
            "This beta is not newer than the installed version"
        }

        val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val previousId = prefs.getLong(KEY_DOWNLOAD_ID, -1L)
        if (previousId >= 0L) manager.remove(previousId)
        apkFile(context).delete()
        clearMetadata(prefs)

        val request = DownloadManager.Request(Uri.parse(update.apkUrl))
            .setTitle("My Life Simulator Beta ${update.versionName}")
            .setDescription("Downloading update")
            .setMimeType("application/vnd.android.package-archive")
            .setAllowedOverMetered(true)
            .setAllowedOverRoaming(false)
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            .setDestinationInExternalFilesDir(context, Environment.DIRECTORY_DOWNLOADS, APK_NAME)

        val id = manager.enqueue(request)
        prefs.edit()
            .putLong(KEY_DOWNLOAD_ID, id)
            .putString(KEY_EXPECTED_SHA, update.sha256.lowercase())
            .putString(KEY_VERSION_NAME, update.versionName)
            .putLong(KEY_VERSION_CODE, update.versionCode)
            .putLong(KEY_CREATED_AT, System.currentTimeMillis())
            .apply()
        return id
    }

    fun isManagedDownload(context: Context, completedId: Long): Boolean =
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getLong(KEY_DOWNLOAD_ID, -1L) == completedId

    fun handleDownloadComplete(context: Context, completedId: Long): Boolean {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        if (!isManagedDownload(context, completedId)) return false

        val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val cursor = manager.query(DownloadManager.Query().setFilterById(completedId)) ?: return false
        val successful = cursor.use {
            it.moveToFirst() &&
                it.getInt(it.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS)) ==
                DownloadManager.STATUS_SUCCESSFUL
        }
        if (!successful) {
            discardDownload(context, completedId)
            return false
        }

        val apk = apkFile(context)
        val expectedSha = prefs.getString(KEY_EXPECTED_SHA, null)
        if (expectedSha.isNullOrBlank() || !apk.isFile ||
            !verifySha256(apk, expectedSha) || !hasCompatibleSigningIdentity(context, apk)
        ) {
            discardDownload(context, completedId)
            return false
        }
        return true
    }

    fun installVerified(context: Context): Boolean {
        val apk = apkFile(context)
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val expectedSha = prefs.getString(KEY_EXPECTED_SHA, null)
        if (expectedSha.isNullOrBlank() || !apk.isFile ||
            !verifySha256(apk, expectedSha) || !hasCompatibleSigningIdentity(context, apk)
        ) {
            discardDownload(context, prefs.getLong(KEY_DOWNLOAD_ID, -1L))
            return false
        }

        if (android.os.Build.VERSION.SDK_INT >= 26 &&
            !context.packageManager.canRequestPackageInstalls()
        ) {
            val permissionIntent = Intent(
                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:${context.packageName}")
            ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(permissionIntent)
            return false
        }

        val contentUri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.beta-updates",
            apk
        )
        val installIntent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(contentUri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(installIntent)
        // Keep the APK until MY_PACKAGE_REPLACED: Android's installer may read it
        // asynchronously, and the user may still cancel the installation.
        return true
    }

    /**
     * Removes only updater-owned temporary artifacts. Game saves, WebView data,
     * settings and all other app data are intentionally outside this cleanup.
     */
    fun cleanupStaleArtifacts(context: Context) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val id = prefs.getLong(KEY_DOWNLOAD_ID, -1L)
        val createdAt = prefs.getLong(KEY_CREATED_AT, 0L)
        val apk = apkFile(context)
        if (id < 0L) {
            // An APK without matching updater metadata is an orphan, not a valid
            // pending install. Do not touch any other app files.
            if (apk.exists()) apk.delete()
            clearMetadata(prefs)
            return
        }
        if (createdAt <= 0L || System.currentTimeMillis() - createdAt > STALE_AFTER_MS) {
            discardDownload(context, id)
        }
    }

    /** Called only after Android reports that this package has been replaced. */
    fun cleanupAfterPackageReplacement(context: Context) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val id = prefs.getLong(KEY_DOWNLOAD_ID, -1L)
        if (id >= 0L) {
            val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            manager.remove(id)
        }
        apkFile(context).delete()
        clearMetadata(prefs)
    }

    private fun discardDownload(context: Context, id: Long) {
        if (id >= 0L) {
            val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            manager.remove(id)
        }
        apkFile(context).delete()
        clearMetadata(context.getSharedPreferences(PREFS, Context.MODE_PRIVATE))
    }

    private fun clearMetadata(prefs: android.content.SharedPreferences) {
        prefs.edit()
            .remove(KEY_DOWNLOAD_ID)
            .remove(KEY_EXPECTED_SHA)
            .remove(KEY_VERSION_NAME)
            .remove(KEY_VERSION_CODE)
            .remove(KEY_CREATED_AT)
            .apply()
    }

    private fun apkFile(context: Context): File {
        val directory = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
            ?: File(context.filesDir, "beta-downloads").apply { mkdirs() }
        return File(directory, APK_NAME)
    }

    @Suppress("DEPRECATION")
    fun installedVersionCode(context: Context): Long {
        val info = context.packageManager.getPackageInfo(context.packageName, 0)
        return if (android.os.Build.VERSION.SDK_INT >= 28) info.longVersionCode else info.versionCode.toLong()
    }

    private fun verifySha256(file: File, expected: String): Boolean = runCatching {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().buffered().use { input ->
            val buffer = ByteArray(64 * 1024)
            while (true) {
                val count = input.read(buffer)
                if (count < 0) break
                digest.update(buffer, 0, count)
            }
        }
        digest.digest().joinToString("") { "%02x".format(it) }.equals(expected, ignoreCase = true)
    }.getOrDefault(false)

    @Suppress("DEPRECATION")
    private fun hasCompatibleSigningIdentity(context: Context, apk: File): Boolean = runCatching {
        val flags = if (android.os.Build.VERSION.SDK_INT >= 28) {
            android.content.pm.PackageManager.GET_SIGNING_CERTIFICATES
        } else {
            android.content.pm.PackageManager.GET_SIGNATURES
        }
        val candidate = context.packageManager.getPackageArchiveInfo(apk.absolutePath, flags) ?: return false
        if (candidate.packageName != context.packageName) return false
        val expectedVersion = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getLong(KEY_VERSION_CODE, -1L)
        val candidateVersion = if (android.os.Build.VERSION.SDK_INT >= 28) candidate.longVersionCode else candidate.versionCode.toLong()
        if (expectedVersion <= installedVersionCode(context) || candidateVersion != expectedVersion) return false

        val installed = context.packageManager.getPackageInfo(context.packageName, flags)
        val candidateSigners = if (android.os.Build.VERSION.SDK_INT >= 28) {
            candidate.signingInfo?.apkContentsSigners
        } else candidate.signatures
        val installedSigners = if (android.os.Build.VERSION.SDK_INT >= 28) {
            installed.signingInfo?.apkContentsSigners
        } else installed.signatures
        if (candidateSigners.isNullOrEmpty() || installedSigners.isNullOrEmpty()) return false

        val candidateDigests = candidateSigners.map { sha256(it.toByteArray()) }.toSet()
        val installedDigests = installedSigners.map { sha256(it.toByteArray()) }.toSet()
        candidateDigests == installedDigests
    }.getOrDefault(false)

    private fun sha256(bytes: ByteArray): String =
        MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }
}

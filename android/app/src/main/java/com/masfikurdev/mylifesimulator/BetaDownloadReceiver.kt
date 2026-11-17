package com.masfikurdev.mylifesimulator

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.widget.Toast

class BetaDownloadReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != android.app.DownloadManager.ACTION_DOWNLOAD_COMPLETE) return
        val id = intent.getLongExtra(android.app.DownloadManager.EXTRA_DOWNLOAD_ID, -1L)
        if (id < 0L) return

        val valid = BetaApkUpdater.handleDownloadComplete(context, id)
        if (valid) {
            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
                ?: return
            launch.action = BetaApkUpdater.ACTION_INSTALL_VERIFIED
            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            context.startActivity(launch)
        } else {
            Toast.makeText(context, "Beta download failed verification. The file was discarded.", Toast.LENGTH_LONG).show()
        }
    }
}

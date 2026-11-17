package com.masfikurdev.mylifesimulator

import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : Activity() {
    private var pageReady = false
    private lateinit var webView: WebView
    private lateinit var progress: ProgressBar
    private lateinit var retry: TextView
    private lateinit var root: FrameLayout
    private lateinit var content: FrameLayout
    private lateinit var splashArtwork: ImageView
    private val preferences by lazy { getSharedPreferences("display_settings", MODE_PRIVATE) }
    private val gameUrl = "https://masfikurdev.github.io/My-Life-Simulator/"
    private var pendingBetaUpdate: BetaUpdate? = null
    private var pendingInstallAfterPermission = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor = Color.TRANSPARENT
        window.decorView.setBackgroundColor(Color.rgb(18, 11, 13))

        root = FrameLayout(this).apply {
            setBackgroundColor(Color.rgb(18, 11, 13))
            clipToPadding = false
        }
        content = FrameLayout(this)
        webView = WebView(this)
        progress = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            max = 100
        }
        retry = TextView(this).apply {
            text = "The game could not be reached. Check your connection and tap here to retry."
            textSize = 15f
            setTextColor(Color.WHITE)
            setPadding(32, 32, 32, 32)
            setBackgroundColor(Color.rgb(12, 16, 13))
            visibility = View.GONE
            setOnClickListener { loadGame() }
        }
        splashArtwork = ImageView(this).apply {
            setImageResource(R.drawable.splash_art)
            scaleType = ImageView.ScaleType.FIT_CENTER
            setBackgroundColor(Color.BLACK)
            contentDescription = null
            importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
        }

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
            cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
        }
        webView.setBackgroundColor(Color.BLACK)
        webView.addJavascriptInterface(GameBridge(), "AndroidApp")
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                if (uri.scheme == "https" && uri.host == "masfikurdev.github.io") return false
                runCatching { startActivity(Intent(Intent.ACTION_VIEW, uri)) }
                return true
            }

            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: android.webkit.WebResourceError) {
                if (request.isForMainFrame) {
                    pageReady = true
                    retry.visibility = View.VISIBLE
                    progress.visibility = View.GONE
                    dismissSplashArtwork()
                }
            }

            override fun onPageFinished(view: WebView, url: String) {
                pageReady = true
                retry.visibility = View.GONE
                progress.visibility = View.GONE
                dismissSplashArtwork()
            }
        }
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView, newProgress: Int) {
                progress.progress = newProgress
                progress.visibility = if (newProgress < 100) View.VISIBLE else View.GONE
            }
        }

        content.addView(webView, FrameLayout.LayoutParams(-1, -1))
        content.addView(progress, FrameLayout.LayoutParams(-1, 5))
        content.addView(retry, FrameLayout.LayoutParams(-1, -2))
        root.addView(content, FrameLayout.LayoutParams(-1, -1))
        root.addView(splashArtwork, FrameLayout.LayoutParams(-1, -1))
        setContentView(root)

        ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
            val immersive = preferences.getBoolean(KEY_FULLSCREEN, false)
            val safe = if (immersive) {
                insets.getInsets(WindowInsetsCompat.Type.displayCutout())
            } else {
                insets.getInsets(
                    WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
                )
            }
            view.setPadding(
                if (immersive) 0 else safe.left,
                if (immersive) 0 else safe.top,
                if (immersive) 0 else safe.right,
                if (immersive) 0 else safe.bottom
            )
            insets
        }
        applyFullscreen(preferences.getBoolean(KEY_FULLSCREEN, false))
        webView.clearCache(true)
        loadGame()
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
        handleUpdaterIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleUpdaterIntent(intent)
    }

    private fun handleUpdaterIntent(intent: Intent?) {
        if (intent == null) return
        when (intent.action) {
            BetaApkUpdater.ACTION_UPDATE_AVAILABLE -> {
                val update = BetaUpdate(
                    versionName = intent.getStringExtra(BetaApkUpdater.EXTRA_VERSION_NAME).orEmpty(),
                    versionCode = intent.getLongExtra(BetaApkUpdater.EXTRA_VERSION_CODE, 0L),
                    releaseUrl = intent.getStringExtra(BetaApkUpdater.EXTRA_RELEASE_URL).orEmpty(),
                    apkUrl = intent.getStringExtra(BetaApkUpdater.EXTRA_APK_URL).orEmpty(),
                    sha256 = intent.getStringExtra(BetaApkUpdater.EXTRA_SHA256).orEmpty(),
                    changelog = intent.getStringExtra(BetaApkUpdater.EXTRA_CHANGELOG).orEmpty()
                )
                if (!update.isValid()) {
                    Toast.makeText(this, "The beta update information is invalid.", Toast.LENGTH_LONG).show()
                    return
                }
                pendingBetaUpdate = update
                if (android.os.Build.VERSION.SDK_INT >= 33 &&
                    checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED
                ) {
                    requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), REQUEST_BETA_NOTIFICATIONS)
                } else {
                    showBetaUpdatePrompt(update)
                }    private fun showBetaUpdatePrompt(update: BetaUpdate) {
        val details = buildString {
            append("Version ").append(update.versionName)
            if (update.changelog.isNotBlank()) append("\n\n").append(update.changelog)
            append("\n\nThe APK will be verified before Android is asked to install it.")
        }
        AlertDialog.Builder(this)
            .setTitle("Beta update available")
            .setMessage(details)
            .setNegativeButton("Later", null)
            .setNeutralButton("Release notes") { _, _ ->
                runCatching { startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(update.releaseUrl))) }
            }
            .setPositiveButton("Download") { _, _ ->
                runCatching { BetaApkUpdater.enqueue(this, update) }
                    .onSuccess { Toast.makeText(this, "Download started. Android will show its progress.", Toast.LENGTH_LONG).show() }
                    .onFailure { Toast.makeText(this, it.message ?: "Could not start the download.", Toast.LENGTH_LONG).show() }
            }
            .show()
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_BETA_NOTIFICATIONS) {
            pendingBetaUpdate?.let(::showBetaUpdatePrompt)
        }
    }

    override fun onResume() {
        super.onResume()
        if (pendingInstallAfterPermission && android.os.Build.VERSION.SDK_INT >= 26 &&
            packageManager.canRequestPackageInstalls()
        ) {
            pendingInstallAfterPermission = false
            BetaApkUpdater.installVerified(this)
        }
    }



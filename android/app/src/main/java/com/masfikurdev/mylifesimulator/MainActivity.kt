package com.masfikurdev.mylifesimulator

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.os.Bundle

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private lateinit var progress: ProgressBar
    private lateinit var retry: TextView
    private val gameUrl = "https://masfikurdev.github.io/My-Life-Simulator/"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val root = FrameLayout(this).apply { setBackgroundColor(Color.rgb(245, 244, 240)) }
        webView = WebView(this)
        progress = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply { max = 100 }
        retry = TextView(this).apply {
            text = "The game could not be reached. Check your connection and tap here to retry."
            textSize = 15f; setTextColor(Color.DKGRAY); setPadding(32, 32, 32, 32); visibility = View.GONE
            setOnClickListener { loadGame() }
        }
        webView.settings.apply {
            javaScriptEnabled = true; domStorageEnabled = true
            allowFileAccess = false; allowContentAccess = false
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
            cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
            setSupportZoom(false); builtInZoomControls = false; displayZoomControls = false
        }
        webView.setBackgroundColor(Color.rgb(245, 244, 240))
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                if (uri.scheme == "https" && uri.host == "masfikurdev.github.io") return false
                runCatching { startActivity(Intent(Intent.ACTION_VIEW, uri)) }
                return true
            }
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: android.webkit.WebResourceError) {
                if (request.isForMainFrame) retry.visibility = View.VISIBLE
            }
            override fun onPageFinished(view: WebView, url: String) { retry.visibility = View.GONE; progress.visibility = View.GONE }
        }
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView, newProgress: Int) {
                progress.progress = newProgress
                progress.visibility = if (newProgress < 100) View.VISIBLE else View.GONE
            }
        }
        root.addView(webView, FrameLayout.LayoutParams(-1, -1))
        root.addView(progress, FrameLayout.LayoutParams(-1, 5))
        root.addView(retry, FrameLayout.LayoutParams(-1, -2))
        setContentView(root)
        // Force a fresh Pages check on cold launch, but allow normal HTTP cache behavior during this session.
        webView.clearCache(true)
        if (savedInstanceState == null) loadGame() else webView.restoreState(savedInstanceState)
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
    }
    private fun loadGame() { retry.visibility = View.GONE; webView.loadUrl(gameUrl) }
    @Deprecated("Deprecated in Android API")
    override fun onBackPressed() { if (::webView.isInitialized && webView.canGoBack()) webView.goBack() else super.onBackPressed() }
    override fun onSaveInstanceState(outState: Bundle) { if (::webView.isInitialized) webView.saveState(outState); super.onSaveInstanceState(outState) }
    override fun onDestroy() { if (::webView.isInitialized) { webView.stopLoading(); webView.destroy() }; super.onDestroy() }
}

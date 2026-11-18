# Android WebView removes JavaScript bridge members unless they are kept.
# Beta is minified, so preserve every method explicitly exposed to page JavaScript.
-keepclassmembers class com.masfikurdev.mylifesimulator.MainActivity$GameBridge {
    @android.webkit.JavascriptInterface <methods>;
}

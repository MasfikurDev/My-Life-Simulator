plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// CI supplies release-specific values; local builds retain safe defaults.
val appVersionCode = providers.gradleProperty("appVersionCode").orNull?.let { value ->
    value.toIntOrNull() ?: error("appVersionCode must be a valid integer.")
} ?: 1
require(appVersionCode > 0) { "appVersionCode must be positive." }
val appVersionName = providers.gradleProperty("appVersionName").orNull ?: "0.1.0"

// CI supplies these values when the persistent beta key is available.
// Local builds remain usable with Android's standard debug signing key.
val persistentDebugSigning = listOf(
    providers.environmentVariable("ANDROID_KEYSTORE_PATH").orNull,
    providers.environmentVariable("ANDROID_KEYSTORE_PASSWORD").orNull,
    providers.environmentVariable("ANDROID_KEY_ALIAS").orNull,
    providers.environmentVariable("ANDROID_KEY_PASSWORD").orNull
).takeIf { values -> values.all { !it.isNullOrBlank() } }

android {
    namespace = "com.masfikurdev.mylifesimulator"
    compileSdk = 35
    buildFeatures { buildConfig = true }
    defaultConfig {
        applicationId = "com.masfikurdev.mylifesimulator"
        minSdk = 24
        targetSdk = 35
        versionCode = appVersionCode
        versionName = appVersionName
    }
    signingConfigs {
        if (persistentDebugSigning != null) {
            create("persistentDebug") {
                storeFile = file(persistentDebugSigning[0]!!)
                storePassword = persistentDebugSigning[1]!!
                keyAlias = persistentDebugSigning[2]!!
                keyPassword = persistentDebugSigning[3]!!
            }
        }
    }
    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            if (persistentDebugSigning != null) {
                signingConfig = signingConfigs.getByName("persistentDebug")
            }
        }
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.core:core-splashscreen:1.0.1")
}

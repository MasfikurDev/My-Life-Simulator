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

// CI supplies these values for beta signing. Local beta builds use the local
// debug key; published beta builds are required to use the persistent key.
val persistentBetaSigning = listOf(
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
        if (persistentBetaSigning != null) {
            create("persistentBeta") {
                storeFile = file(persistentBetaSigning[0]!!)
                storePassword = persistentBetaSigning[1]!!
                keyAlias = persistentBetaSigning[2]!!
                keyPassword = persistentBetaSigning[3]!!
            }
        }
    }
    buildTypes {
        debug {
            // Developer installs are separate from the installed beta app.
            applicationIdSuffix = ".dev"
            versionNameSuffix = "-dev"
        }
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        create("beta") {
            // Beta behaves like release while retaining the existing beta identity.
            initWith(getByName("release"))
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-beta"
            isDebuggable = false
            isMinifyEnabled = true
            signingConfig = if (persistentBetaSigning != null) {
                signingConfigs.getByName("persistentBeta")
            } else {
                signingConfigs.getByName("debug")
            }
            matchingFallbacks += listOf("release")
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

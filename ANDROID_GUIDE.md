# CivicEye Android Application Guide

CivicEye is equipped with a complete native Android application setup using **Capacitor**, alongside **Progressive Web App (PWA)** mobile installation support.

---

## Architecture Overview

```
CIVIC EYE/
├── android/                         # Official Native Android Project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml  # Native Camera & GPS Permissions
│   │   │   ├── java/org/civiceye/app/MainActivity.java
│   │   │   └── res/                 # App icons, splash screens, strings
│   │   └── build.gradle             # Android build configuration
│   ├── gradlew.bat                  # Gradle wrapper for CLI builds
│   └── build.gradle
├── capacitor.config.ts              # Capacitor Bridge Configuration
├── src/app/manifest.ts              # Dynamic Web App Manifest (PWA)
└── public/
    └── index.html                   # Mobile fallback & splash loader
```

---

## Method 1: Run & Build via Android Studio

If you have **Android Studio** installed on your computer:

1. **Open the Project in Android Studio**:
   ```bash
   npm run cap:open
   ```
   This will automatically launch Android Studio with the `android/` directory loaded.

2. **Run on an Android Phone or Emulator**:
   - Connect your Android phone via USB with **USB Debugging** enabled (or start an Android Virtual Device emulator in Android Studio).
   - Click the green **Run (▶)** button in Android Studio.
   - CivicEye will install and launch as a full native app on your phone.

3. **Generate an APK file**:
   - In Android Studio menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - The generated `.apk` file will be located at:
     `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Method 2: Build the APK from Terminal / Command Line

You can build the APK directly using Gradle:

```bash
cd android
./gradlew assembleDebug
```
*(On Windows Command Prompt: `gradlew.bat assembleDebug`)*

Once completed, the debug APK is located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

To install it directly to a connected phone with `adb`:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Method 3: Instant PWA Mobile Installation (No APK Required)

Any citizen or municipal administrator can also install CivicEye directly from their phone's browser without downloading an APK:

1. On your Android phone, open Chrome and navigate to:
   **[https://civic-eye-two.vercel.app](https://civic-eye-two.vercel.app)**
2. Tap the browser menu (three vertical dots `⋮` at the top-right).
3. Tap **"Install app"** or **"Add to Home screen"**.
4. CivicEye will appear on your Android home screen and in your app drawer as a standalone native app with the official app icon and full-screen experience.

---

## Key Mobile Features Configured

- **Hardware Camera Access**: Automatically requests and interfaces with the device camera for defect photo evidence.
- **GPS Telemetry**: Captures high-accuracy geolocation (`±meters`) with hardware location sensor permissions.
- **Unified Light SaaS Design**: Clean Class AI white design system with responsive mobile viewports, zero zoom glitching, and notch-safe areas.
- **Dual Citizen / Admin Authentication**: Dedicated mobile sign-in experience with instant role routing.
- **Live Cloud Sync**: Seamlessly syncs with Google Gemini AI triage, Firebase Firestore, and Google Maps.

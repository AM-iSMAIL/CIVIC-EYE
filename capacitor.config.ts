import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.civiceye.app',
  appName: 'CivicEye',
  webDir: 'public',
  server: {
    // Connects native Android app directly to our deployed production backend
    url: 'https://civic-eye-two.vercel.app',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#fbfcfd',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#fbfcfd',
    },
  },
};

export default config;

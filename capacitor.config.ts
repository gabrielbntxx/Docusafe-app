import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.justif.app',
  appName: "JUSTIF'",
  webDir: '.next',
  server: {
    // Point to Railway production URL
    url: 'https://justif-app-production.up.railway.app',
    cleartext: false
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;

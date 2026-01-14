import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.justif.app',
  appName: "JUSTIF'",
  webDir: 'out',
  server: {
    // Point to your production API or use localhost for dev
    url: process.env.CAPACITOR_SERVER_URL || undefined,
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;

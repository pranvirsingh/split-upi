import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.splitupi',
  appName: 'SplitUPI',
  webDir: 'dist',
  backgroundColor: '#0c1210',
  android: {
    allowMixedContent: false,
  },
};

export default config;

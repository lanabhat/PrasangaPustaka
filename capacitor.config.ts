import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pratisangraha.app',
  appName: 'Pratisangraha',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

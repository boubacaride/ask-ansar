import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Ask Ansar',
  slug: 'ask-ansar',
  version: '1.0.0',
  orientation: 'portrait',
  icon: 'https://d6artovf3mfn.cloudfront.net/images/AV-LOGO-48x48.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    buildNumber: '2',
    bundleIdentifier: 'com.ansarvoyage.askansar',
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Allow Ask Ansar to use your location for navigation to sacred places and the Seerah map experience.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Allow Ask Ansar to use your location for navigation to sacred places and the Seerah map experience.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: 'https://d6artovf3mfn.cloudfront.net/images/AV-LOGO-48x48.png',
      backgroundColor: '#0D5C63',
    },
    package: 'com.ansarvoyage.askansar',
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: 'https://d6artovf3mfn.cloudfront.net/images/AV-LOGO-48x48.png',
  },
  plugins: [
    'expo-router',
    'expo-auth-session',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Ask Ansar to use your location for navigation to sacred places and the Seerah map experience.',
        locationWhenInUsePermission:
          'Allow Ask Ansar to use your location for navigation to sacred places and the Seerah map experience.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    eas: {
      projectId: '5706ffd8-a468-4b73-9181-126eea9fbb83',
    },
  },
});

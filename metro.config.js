const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add web configuration for PWA
if (process.env.EXPO_WEB_BUILD_MODE === 'production') {
  config.web = {
    ...config.web,
    favicon: 'https://ansarv1.s3.us-east-2.amazonaws.com/images/Icon-76%402x.png',
  };
}

// Add module resolver configuration
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    '@': `${__dirname}`,
  },
};

// Reduce memory usage and improve performance
config.maxWorkers = 2;
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    ecma: 8,
    keep_classnames: true,
    keep_fnames: true,
    module: true,
    mangle: {
      safari10: true,
    },
  },
};

// Use simple file system cache
config.cacheVersion = '1.0';

module.exports = config;
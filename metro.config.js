const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

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
config.resetCache = true;

module.exports = config;
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reduce logging in development
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Disable source maps in development to reduce noise
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;

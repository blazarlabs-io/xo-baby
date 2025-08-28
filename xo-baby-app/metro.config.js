// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// 1) Merge the default transformer props, add SVG support + correct assetRegistryPath:
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  assetRegistryPath: require.resolve('react-native/Libraries/Image/AssetRegistry'),
};

// 2) Wire up the resolver for SVGs (leave all other assetExts—including .ttf—in place):
config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@assets': path.resolve(__dirname, 'assets'),
  },
};

module.exports = config;

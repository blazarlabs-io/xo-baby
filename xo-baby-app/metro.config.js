const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const path = require('path');

config.transformer = {
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver = {
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],

  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@assets': path.resolve(__dirname, 'assets'),
  },
};

module.exports = config;
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support wasm and json assets
config.resolver.assetExts.push('wasm');

module.exports = config;

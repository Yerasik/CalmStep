const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const shared = path.resolve(projectRoot, '../../packages/shared');

const config = getDefaultConfig(projectRoot);
config.watchFolders = [shared];
config.resolver.extraNodeModules = {
  '@calmstep/shared': shared,
};

module.exports = config;

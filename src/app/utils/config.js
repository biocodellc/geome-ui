/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */

// The 'config' module is an alias to config/xxx.js file
// which is dynamically alias via webpack based on the NODE_ENV
// variable. A default.js configuration is provided and serves.
// as the base configuration. If NODE_ENV === development, then
// the config module will be the config/development.js configuration
// file and will extend the default.js config
// you can also create a `config/local.js` config file that will
// extend the default.js if NODE_ENV is not set
import config from 'config';
import defaultConfig from '../../../config/default';

if (process.env.MAPBOX_TOKEN) config.mapboxToken = process.env.MAPBOX_TOKEN;

export default Object.assign({}, defaultConfig, config);

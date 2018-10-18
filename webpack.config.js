const path = require('path');
const fs = require('fs');

// Modules
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
const ENV = process.env.npm_lifecycle_event;
const isTest = ENV === 'test' || ENV === 'test-watch';
const isProd = ENV === 'build';

const PORT = 3000;

// Helper functions
function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join(...[__dirname].concat(args));
}

const css = (extend = []) => {
  if (isTest) return ['null-loader'];

  // Reference: https://github.com/postcss/postcss-loader
  // Postprocess your css with PostCSS plugins
  // Reference: https://github.com/webpack-contrib/mini-css-extract-plugin
  // Extract css files in production builds
  //
  // Reference: https://github.com/webpack/style-loader
  // Use style-loader in development.
  return [
    isProd ? MiniCssExtractPlugin.loader : 'style-loader',
    isProd
      ? 'css-loader'
      : {
          loader: 'css-loader',
          options: { sourceMap: false, importLoaders: 1 },
        },
    isProd
      ? 'postcss-loader'
      : {
          loader: 'postcss-loader',
          options: {
            sourceMap: false,
            config: { path: './postcss.config.js' },
          },
        },
  ].concat(extend);
};

module.exports = (function makeWebpackConfig() {
  /**
   * Config
   * Reference: http://webpack.github.io/docs/configuration.html
   * This is the object where all configuration gets set
   */
  const config = {};

  config.mode = isProd ? 'production' : 'development';

  /**
   * Entry
   * Reference: http://webpack.github.io/docs/configuration.html#entry
   * Should be an empty object if it's generating a test build
   * Karma will set this when it's a test build
   */
  config.entry = isTest
    ? void 0
    : {
        app: ['babel-polyfill', './src/app/app.js'],
      };

  /**
   * Output
   * Reference: http://webpack.github.io/docs/configuration.html#output
   * Should be an empty object if it's generating a test build
   * Karma will handle setting it up for you when it's a test build
   */
  config.output = isTest
    ? {}
    : {
        // Absolute output directory
        path: `${__dirname}/dist`,
        // Output path from the view of the page
        // Uses webpack-dev-server in development
        // publicPath: isProd ? '/' : `http://0.0.0.0:${PORT}/`,
        publicPath: isProd ? '/' : `http://localhost:${PORT}/`,

        // Filename for entry points
        // Only adds hash in build mode
        filename: isProd ? '[name].[hash].js' : '[name].bundle.js',

        // Filename for non-entry points
        // Only adds hash in build mode
        chunkFilename: isProd ? '[name].[hash].js' : '[name].bundle.js',

        pathinfo: !isProd,

        // needed for Web Workers
        globalObject: 'this',
      };

  /**
   * Loaders
   * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
   * List: http://webpack.github.io/docs/list-of-loaders.html
   * This handles most of the magic responsible for converting modules
   */

  // Initialize module
  config.module = {
    rules: [
      {
        // JS LOADER
        // Reference: https://github.com/babel/babel-loader
        // Transpile .js files using babel-loader
        // Compiles ES6 and ES7 into ES5 code
        // NOTICE: babel-loader must be the first loader. Otherwise
        // the sourceMappings will be incorrect, preventing breakpoints from being set in
        // certain situations
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
        include: [
          path.resolve(__dirname, 'src', 'app'),
          path.resolve(__dirname, 'config'),
        ],
      },
      // WebWorker loader
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      },
      {
        // support for .scss files
        // all sass not in src/app will be bundled in an external css file
        test: /\.(scss|sass)$/,
        exclude: root('src', 'app'),
        use: css([
          isProd
            ? 'sass-loader'
            : {
                loader: 'sass-loader',
                options: { sourceComments: true },
              },
        ]),
      },
      {
        // all sass required in src/app files will be merged in js files
        test: /\.(scss|sass)$/,
        include: root('src', 'app'),
        loader: 'raw-loader!postcss-loader!sass-loader',
      },
      {
        // CSS LOADER
        // Reference: https://github.com/webpack/css-loader
        // Allow loading css through js
        test: /\.css$/,
        use: css(),
      },
      {
        // ASSET LOADER
        // Reference: https://github.com/webpack/file-loader
        // Copy png, jpg, jpeg, gif, svg, woff, woff2, ttf, eot files to output
        // Rename the file using the asset hash
        // Pass along the updated reference to your code
        // You can add here any file extension you want to get copied to your output
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        loader: 'file-loader',
      },
      {
        // HTML LOADER
        // Reference: https://github.com/webpack/raw-loader
        // Allow loading html through js
        test: /\.html$/,
        loader: 'raw-loader',
      },
    ],
  };

  // creates an alias "config" that we can use to import a config file
  // dependent on the current CONFIG_ENV
  const fallbackConfig = fs.existsSync(
    path.join(__dirname, 'config', 'local.js'),
  )
    ? 'local'
    : 'default';

  config.resolve = {
    alias: {
      config: path.join(
        __dirname,
        'config',
        process.env.CONFIG_ENV ? process.env.CONFIG_ENV : fallbackConfig,
      ),
    },
  };

  // ISTANBUL LOADER
  // https://github.com/deepsweet/istanbul-instrumenter-loader
  // Instrument JS files with istanbul-lib-instrument for subsequent code coverage reporting
  // Skips node_modules and files that end with .spec.js
  if (isTest) {
    config.module.rules.push({
      enforce: 'pre',
      test: /\.js$/,
      exclude: [/node_modules/, /\.spec\.js$/],
      loader: 'istanbul-instrumenter-loader',
      query: {
        esModules: true,
      },
    });
  }

  /**
   * PostCSS
   * Reference: https://github.com/postcss/autoprefixer-core
   * Add vendor prefixes to your css
   */
  // NOTE: This is now handled in the `postcss.config.js`

  /**
   * Plugins
   * Reference: http://webpack.github.io/docs/configuration.html#plugins
   * List: http://webpack.github.io/docs/list-of-plugins.html
   */
  config.plugins = [
    new webpack.ProvidePlugin({
      L: 'leaflet',
    }),

    new webpack.HotModuleReplacementPlugin(),
  ];

  // Skip rendering index.html in test mode
  if (!isTest) {
    // Reference: https://github.com/ampedandwired/html-webpack-plugin
    // Render index.html
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: './src/public/index.html',
        inject: 'body',
      }),
      new webpack.EnvironmentPlugin({
        MAPBOX_TOKEN: null,
        FIMS_CLIENT_ID: null,
      }),
    );
  }

  /**
   * Devtool
   * Reference: http://webpack.github.io/docs/configuration.html#devtool
   * Type of sourcemap to use per build type
   */
  if (isTest) {
    config.devtool = 'inline-source-map';
  } else if (isProd) {
    config.devtool = 'source-map';
  } else {
    // config.devtool = 'cheap-module-source-map';
    config.devtool = 'eval-source-map';
  }

  if (isProd) {
    // configure optimizations
    config.optimization = {
      splitChunks: {
        cacheGroups: {
          // create a seperate bundle for node_modules
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules|(src\/vendor)[\\/]/,
            chunks: 'all',
            reuseExistingChunk: true,
          },
          // Extract css to single file https://github.com/webpack-contrib/mini-css-extract-plugin#extracting-all-css-in-a-single-file
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    };

    // Add build specific plugins
    config.plugins.push(
      // Reference: https://github.com/webpack-contrib/mini-css-extract-plugin
      // Extract css files
      new MiniCssExtractPlugin({
        filename: 'css/[name]-[hash:6].css',
        allChunks: true,
      }),

      // Copy assets from the public folder
      // Reference: https://github.com/kevlened/copy-webpack-plugin
      new CopyWebpackPlugin([
        {
          from: `${__dirname}/src/public`,
        },
      ]),
    );
  }

  /**
   * Dev server configuration
   * Reference: http://webpack.github.io/docs/configuration.html#devserver
   * Reference: http://webpack.github.io/docs/webpack-dev-server.html
   */
  config.devServer = {
    contentBase: './src/public',
    historyApiFallback: true,
    // hot: true,
    hotOnly: true, // no page reload as fallback
    // stats: 'minimal',
    port: PORT,
  };

  return config;
})();

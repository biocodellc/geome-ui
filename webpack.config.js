const path = require('path');
const fs = require('fs');

// Modules
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');

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

module.exports = (function makeWebpackConfig() {
  /**
   * Config
   * Reference: http://webpack.github.io/docs/configuration.html
   * This is the object where all configuration gets set
   */
  const config = {};

  if (isProd) config.mode = 'production';
  else config.mode = 'development';

  /**
   * Entry
   * Reference: http://webpack.github.io/docs/configuration.html#entry
   * Should be an empty object if it's generating a test build
   * Karma will set this when it's a test build
   */
  config.entry = isTest
    ? void 0
    : {
        app: './src/app/app.js',
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
        publicPath: isProd ? '/' : `http://localhost:${PORT}/`,

        // Filename for entry points
        // Only adds hash in build mode
        filename: isProd ? '[name].[hash].js' : '[name].bundle.js',

        // Filename for non-entry points
        // Only adds hash in build mode
        chunkFilename: isProd ? '[name].[hash].js' : '[name].bundle.js',
      };

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
    config.devtool = 'cheap-module-source-map';
  }

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
        use: [{ loader: 'babel-loader' }],
        exclude: /node_modules/,
      },
      {
        // support for .scss files
        // use 'null' loader in test mode (https://github.com/webpack/null-loader)
        // all css in src/style will be bundled in an external css file
        test: /\.(scss|sass)$/,
        // exclude: root('src', 'app'),
        use: isTest
          ? ['null-loader']
          : [
              MiniCssExtractPlugin.loader,
              // fallbackLoader: 'style-loader',
              // loader: [
              { loader: 'css-loader', options: { sourceMap: true } },
              { loader: 'postcss-loader', options: { sourceMap: true } },
              { loader: 'sass-loader', options: { sourceMap: true } },
            ],
      },
      {
        // all css required in src/app files will be merged in js files
        test: /\.(scss|sass)$/,
        exclude: root('src', 'style'),
        loader: 'raw-loader!postcss-loader!sass-loader',
      },
      {
        // CSS LOADER
        // Reference: https://github.com/webpack/css-loader
        // Allow loading css through js
        //
        // Reference: https://github.com/postcss/postcss-loader
        // Postprocess your css with PostCSS plugins
        test: /\.css$/,
        // Reference: https://github.com/webpack-contrib/mini-css-extract-plugin
        // Extract css files in production builds
        //
        // Reference: https://github.com/webpack/style-loader
        // Use style-loader in development.

        use: isTest
          ? ['null-loader']
          : [
              MiniCssExtractPlugin.loader,
              // fallbackLoader: 'style-loader',
              // loader: [
              { loader: 'css-loader', query: { sourceMap: true } },
              { loader: 'postcss-loader' },
            ],
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
  // dependent on the current NODE_ENV
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
        process.env.NODE_ENV ? process.env.NODE_ENV : fallbackConfig,
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
  //       webpack2 has some issues, making the config file necessary

  /**
   * Plugins
   * Reference: http://webpack.github.io/docs/configuration.html#plugins
   * List: http://webpack.github.io/docs/list-of-plugins.html
   */
  config.plugins = [
    new webpack.LoaderOptionsPlugin({
      test: /\.scss$/i,
      options: {
        postcss: {
          plugins: [autoprefixer],
        },
      },
    }),

    // todo remove the following and use only angular-ui-bootstrap
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),

    new DashboardPlugin(), // webpack-dashboard
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

      // Reference: https://github.com/webpack-contrib/mini-css-extract-plugin
      // Extract css files
      // Disabled when in test mode or not in build mode
      new MiniCssExtractPlugin({
        filename: 'css/[name].css',
        disable: !isProd,
        allChunks: true,
      }),
    );
  }

  // configure optimizations
  // Extract css to single file https://github.com/webpack-contrib/mini-css-extract-plugin#extracting-all-css-in-a-single-file
  if (isProd) {
    config.optimization = {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    };
  }

  // Add build specific plugins
  if (isProd) {
    config.plugins.push(
      // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
      // Dedupe modules in the output
      // new webpack.optimize.DedupePlugin(),

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
    hot: true,
    // stats: 'minimal',
    port: PORT,
  };

  return config;
})();

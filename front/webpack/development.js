const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const LivereloadPlugin = require('webpack-livereload-plugin');
const shared = require('./shared');

const CWD = process.cwd();
const SRC_DIR = path.join(CWD, 'front');
const DEST_DIR = path.join(CWD, 'public');

module.exports = {
  context: SRC_DIR,
  entry: {
    main: './main.js',
    shared: './shared.js'
  },
  output: {
    filename: '[name].js',
    path: DEST_DIR,
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        include: SRC_DIR,
        loader: 'eslint-loader'
      },
      {
        test: /\.js$/,
        include: SRC_DIR,
        loader: 'babel-loader',
        options: {
          cacheDirectory: path.join(CWD, 'tmp', 'babel-cache')
        }
      },
      {
        test: /\.svg$/,
        issuer: /\.js$/,
        include: SRC_DIR,
        use: [
          {
            loader: 'svg-inline-loader'
          },
          {
            loader: 'image-webpack-loader',
            options: {
              svgo: {
                plugins: [
                  { cleanupIDs: false }
                ]
              }
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        issuer: /\.p?css$/,
        include: SRC_DIR,
        loaders: ['svg-url-loader', 'image-webpack-loader']
      },
      {
        test: /\.p?css$/,
        include: SRC_DIR,
        use: ExtractTextPlugin.extract(['css-loader', 'postcss-loader'])
      },
      {
        test: /\.mustache$/,
        include: SRC_DIR,
        loader: 'mustache-loader'
      }
    ]
  },
  plugins: [
    new CleanPlugin(DEST_DIR, { root: CWD }),
    new CopyPlugin([
      {
        context: path.join(SRC_DIR, 'static'),
        from: '**/*',
        to: DEST_DIR
      }
    ]),
    new webpack.DefinePlugin({
      __DEVELOPMENT__: 'true'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['manifest', 'shared'],
      minChunks: module => module.resource && !module.resource.includes(SRC_DIR)
    }),
    new webpack.NamedModulesPlugin(),
    new ExtractTextPlugin('styles.css'),
    new StatsWriterPlugin({
      filename: 'assets-mapping.json',
      fields: null,
      transform: shared.assetsTransform
    }),
    new StylelintPlugin({
      files: ['**/*.pcss']
    }),
    new LivereloadPlugin()
  ],
  devtool: 'eval',
  watch: true
};

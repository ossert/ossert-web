const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;

const SRC_DIR = path.join(__dirname, 'front');
const PUBLIC_DIR = path.join(__dirname, 'public', 'front');

module.exports = {
  context: SRC_DIR,
  entry: {
    main: './main.js',
    shared: 'babel-polyfill'
  },
  output: {
    path: PUBLIC_DIR,
    publicPath: '/',
    filename: '[name]-[chunkhash].js'
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: SRC_DIR,
        loader: 'babel-loader'
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        include: SRC_DIR,
        loader: 'eslint-loader'
      },
      {
        test: /\.svg$/,
        include: SRC_DIR,
        loader: 'svg-inline-loader'
      },
      {
        test: /\.pcss$/,
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
    new CleanPlugin(PUBLIC_DIR),
    new StylelintPlugin({
      files: ['**/*.pcss']
    }),
    new StatsWriterPlugin({
      filename: 'stats.json',
      fields: null,
      transform: data => JSON.stringify(Object.keys(data.assetsByChunkName).reduce((result, bundle) => {
        const jsAssets = data.assetsByChunkName[bundle].filter(filterByExt('js'));
        const cssAssets = data.assetsByChunkName[bundle].filter(filterByExt('css'));

        if (jsAssets.length) {
          result.bundles[bundle] = jsAssets[0];
        }

        if (cssAssets.length) {
          result.css = cssAssets[0];
        }

        return result;
      }, { bundles: {}, css: null }))
    }),
    new webpack.DefinePlugin({
      __DEVELOPMENT__: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'shared',
      minChunks: module => module.resource && !module.resource.includes(SRC_DIR)
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    }),
    new ExtractTextPlugin('styles-[contenthash:20].css')
  ],
  devtool: 'source-map'
};

function filterByExt(ext) {
  return value => (new RegExp(`\\.${ext}$`)).test(value);
}
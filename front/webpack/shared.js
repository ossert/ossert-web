const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;

const CWD = process.cwd();
const SRC_DIR = path.join(CWD, 'front');
const DEST_DIR = path.join(CWD, 'public');

module.exports.SRC_DIR = SRC_DIR;
module.exports.DEST_DIR = DEST_DIR;

module.exports.config = {
  context: SRC_DIR,
  entry: {
    main: './main.js',
    shared: 'babel-polyfill'
  },
  output: {
    path: DEST_DIR,
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  module: {
    rules: [
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
    new StatsWriterPlugin({
      filename: 'stats.json',
      fields: null,
      transform: data => JSON.stringify(Object.keys(data.assetsByChunkName).reduce((result, bundle) => {
        const bundleChunks = Array.isArray(data.assetsByChunkName[bundle])
          ? data.assetsByChunkName[bundle]
          : [data.assetsByChunkName[bundle]];

        const jsAssets = bundleChunks.filter(filterByExt('js'));
        const cssAssets = bundleChunks.filter(filterByExt('css'));

        if (jsAssets.length) {
          result.bundles[bundle] = jsAssets[0];
        }

        if (cssAssets.length) {
          result.css = cssAssets[0];
        }

        return result;
      }, { bundles: {}, css: null }))
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'shared',
      minChunks: module => module.resource && !module.resource.includes(SRC_DIR)
    })
  ]
};

function filterByExt(ext) {
  return value => (new RegExp(`\\.${ext}$`)).test(value);
}

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const shared = require('./shared');

module.exports = Object.assign(
  shared.config,
  {
    output: Object.assign(
      shared.config.output,
      {
        filename: '[name]-[chunkhash].js'
      }
    ),
    plugins: shared.config.plugins.concat(
      new webpack.DefinePlugin({
        __DEVELOPMENT__: false
      }),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true
      }),
      new ExtractTextPlugin('styles-[contenthash:20].css')
    ),
    devtool: 'source-map'
  }
);

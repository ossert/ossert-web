const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const LivereloadPlugin = require('webpack-livereload-plugin');
const shared = require('./shared');

module.exports = Object.assign(
  shared.config,
  {
    output: Object.assign(
      shared.config.output,
      {
        filename: '[name].js'
      }
    ),
    module: Object.assign(
      shared.config.module,
      {
        rules: shared.config.module.rules.concat(
          {
            enforce: 'pre',
            test: /\.js$/,
            include: shared.SRC_DIR,
            loader: 'eslint-loader'
          }
        )
      }
    ),
    plugins: shared.config.plugins.concat(
      new webpack.DefinePlugin({
        __DEVELOPMENT__: true
      }),
      new StylelintPlugin({
        files: ['**/*.pcss']
      }),
      new ExtractTextPlugin('styles.css'),
      new LivereloadPlugin()
    ),
    devtool: 'cheap-module-eval-source-map',
    watch: true
  }
);

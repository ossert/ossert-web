const webpack = require('webpack');
const isProd = process.env.NODE_ENV === 'production';

const plugins = [
  new webpack.NoErrorsPlugin()
];

if (isProd) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({ minimize: true }));
}

module.exports = {
  output: {
    filename: '[name].js'
  },
  resolve: { extensions: ['', '.js', '.jsx', '.json'] },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel', exclude: /node_modules/ },
      { test: /\.mustache/, loader: 'mustache?minify' }
    ]
  },
  plugins: plugins,
  devtool: 'source-map'
};

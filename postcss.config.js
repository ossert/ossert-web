const path = require('path');
const mixins = require('postcss-mixins');
const simpleVars = require('postcss-simple-vars');
const nested = require('postcss-nested');
const customMedia = require('postcss-custom-media');
const mediaMinmax = require('postcss-media-minmax');
const utilities = require('postcss-utilities');
const colorFunction = require('postcss-color-function');
const easings = require('postcss-easings');
const calc = require('postcss-calc');
const autoprefixer = require('autoprefixer');

const POSTCSS_DIR = path.join(__dirname, 'front', 'postcss');
const mixinsDir = path.join(POSTCSS_DIR, 'mixins');
const variables = require(path.join(POSTCSS_DIR, 'css-vars'));
const extensions = require(path.join(POSTCSS_DIR, 'css-media'));

module.exports = {
  plugins: [
    mixins({ mixinsDir }),
    simpleVars({ variables }),
    nested,
    customMedia({ extensions }),
    mediaMinmax,
    utilities,
    colorFunction,
    easings,
    calc,
    autoprefixer
  ]
};

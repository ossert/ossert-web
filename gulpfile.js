/* eslint-disable global-require */

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const del = require('del');
const path = require('path');
const fs = require('fs');
const bs = require('browser-sync').create();
const webpackStream = require('webpack-stream');

const ENVS = {
  PROD: 'production',
  DEV: 'development'
};
const EXTS_TO_FREEZE = 'jpg|jpeg|png|svg|css|js';
const SRC_DIR = path.join(__dirname, 'front');
const BUILD_DIR = 'public';
const BLOCKS_DIR = path.join(SRC_DIR, 'blocks');
const POSTCSS_DIR = path.join(SRC_DIR, 'postcss');
const JS_MAIN = path.join(SRC_DIR, 'main.js');
const PATHS = {
  VENDORS: path.join(SRC_DIR, 'vendors', '*.*'),
  COMMON: path.join(SRC_DIR, 'common', '**', '*.pcss'),
  MIXINS: path.join(SRC_DIR, 'mixins', '**', '*.pcss'),
  BLOCKS: path.join(SRC_DIR, '**', '*.pcss'),
  BLOCKS_ASSETS: path.join(BLOCKS_DIR, '**', '*.*(svg|jpeg|jpeg|png|gif)'),
  BLOCKS_JS: path.join(BLOCKS_DIR, '**', '*.js'),
  ROOT_HTML: path.join(SRC_DIR, '*.html'),
  POSTCSS: path.join(POSTCSS_DIR, '*.js'),
  SVG_SPRITE: path.join(BLOCKS_DIR, 'icon', 'icons-sprite.svg')
};
let svgSprite = loadSvgSprite(PATHS.SVG_SPRITE);

gulp.task('env:set-prod', fn => {
  process.env.NODE_ENV = ENVS.PROD;
  fn();
});

gulp.task('env:set-dev', fn => {
  process.env.NODE_ENV = ENVS.DEV;
  fn();
});

gulp.task('blocks:styles', () => {
  return gulp.src([PATHS.VENDORS, PATHS.COMMON, PATHS.MIXINS, PATHS.BLOCKS])
    .pipe($.plumber({ errorHandler: notifyOnErrorFactory('CSS') }))
    .pipe($.sourcemaps.init())
    .pipe($.postcss([
      require('postcss-mixins'),
      require('postcss-simple-vars')({
        variables: require(path.join(POSTCSS_DIR, 'css-vars'))
      }),
      require('postcss-nested'),
      require('postcss-custom-media')({
        extensions: require(path.join(POSTCSS_DIR, 'css-media'))
      }),
      require('postcss-media-minmax'),
      require('postcss-utilities'),
      require('postcss-color-function'),
      require('postcss-easings'),
      require('postcss-calc'),
      require('autoprefixer')
    ]))
    .pipe($.remember('css-remember'))
    .pipe($.rewriteCss({ destination: SRC_DIR }))
    .pipe($.concat('styles.css'))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(BUILD_DIR, 'css')));
});

gulp.task('blocks:assets', () => {
  return gulp.src([PATHS.BLOCKS_ASSETS, `!${PATHS.SVG_SPRITE}`], { base: SRC_DIR })
    .pipe($.plumber({ errorHandler: notifyOnErrorFactory('Blocks assets') }))
    .pipe($.newer(BUILD_DIR))
    .pipe(gulp.dest(path.join(BUILD_DIR, 'assets')));
});

gulp.task('blocks:js', () => {
  return gulp.src(JS_MAIN)
    .pipe($.plumber({ errorHandler: notifyOnErrorFactory('Js') }))
    .pipe(webpackStream(require('./webpack.config')))
    .pipe(gulp.dest(path.join(BUILD_DIR, 'js')));
});

gulp.task('watch', () => {
  gulp
    .watch([PATHS.VENDORS, PATHS.COMMON, PATHS.MIXINS, PATHS.BLOCKS], gulp.parallel('blocks:styles', 'lint:styles'))
    .on('unlink', filePath => {
      const resolvedFilePath = path.resolve(filePath);
      $.remember.forget('css-remember', resolvedFilePath);

      if ($.cached && $.cached.caches && $.caches['css-cached']) {
        delete $.cached.caches['css-cached'][resolvedFilePath];
      }
    });
  gulp.watch([JS_MAIN, PATHS.BLOCKS_JS], gulp.series('blocks:js'));
  gulp.watch([PATHS.BLOCKS_ASSETS, `!${PATHS.SVG_SPRITE}`], gulp.series('blocks:assets'));
  gulp.watch(PATHS.ROOT_HTML, gulp.series('html'));
  gulp.watch(PATHS.POSTCSS).on('change', postcssPath => {
    delete require.cache[postcssPath];
    gulp.series('blocks:styles', 'lint:styles')();
  });
  gulp.watch(PATHS.SVG_SPRITE).on('change', svgPath => {
    loadSvgSprite(svgPath, data => {
      svgSprite = data;
      gulp.series('html')();
    });
  });
});

gulp.task('serve', () => {
  bs.init({ server: BUILD_DIR });
});

gulp.task('serve:watch', () =>{
  bs.init({
    server: BUILD_DIR,
    port: process.env.PORT || 3000
  });
  bs.watch(BUILD_DIR).on('change', bs.reload);
});

gulp.task('lint:styles', () =>{
  return gulp
    .src(PATHS.BLOCKS)
    .pipe($.plumber({ errorHandler: notifyOnErrorFactory('Lint:styles') }))
    .pipe($.stylelint({ reporters: [{ formatter: 'string', console: true }] }));
});

function notifyOnErrorFactory(title) {
  return $.notify.onError(err => ({ title: title, message: err.message }));
}

function loadSvgSprite(svgPath, cb) { // eslint-disable-line consistent-return
  if (cb) {
    fs.readFile(svgPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }

      cb(data);
    });
  } else {
    return fs.readFileSync(svgPath, 'utf8');
  }
}


gulp.task('default', gulp.parallel('blocks:styles', 'lint:styles', 'blocks:assets', 'blocks:js'));
gulp.task('prod', gulp.series('env:set-prod', 'default'));
gulp.task('prod:serve', gulp.series('env:set-prod', 'default', 'serve'));
gulp.task('dev', gulp.series('env:set-dev', 'default', gulp.parallel('watch', 'serve:watch')));
gulp.task('dev:serve', gulp.series('env:set-dev', 'default', 'serve'));

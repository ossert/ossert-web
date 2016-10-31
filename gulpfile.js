/* eslint-disable global-require */

const $ = require('gulp-load-plugins')();
const gulp = require('gulp');
const path = require('path');
const webpackStream = require('webpack-stream');

const ENVS = {
  PROD: 'production',
  DEV: 'development'
};
const SRC_DIR = path.join(__dirname, 'front');
const BUILD_DIR = path.join(__dirname, 'public');
const BLOCKS_DIR = path.join(SRC_DIR, 'blocks');
const POSTCSS_DIR = path.join(SRC_DIR, 'postcss');
const JS_MAIN = path.join(SRC_DIR, 'main.js');
const PATHS = {
  VENDORS: path.join(SRC_DIR, 'vendors', '*.*'),
  COMMON: path.join(SRC_DIR, 'common', '**', '*.pcss'),
  MIXINS: path.join(SRC_DIR, 'mixins', '**', '*.pcss'),
  BLOCKS_STYLES: path.join(SRC_DIR, '**', '*.pcss'),
  BLOCKS_ASSETS: path.join(BLOCKS_DIR, '**', '*.*(svg|jpeg|jpeg|png|gif)'),
  BLOCKS_JS: path.join(BLOCKS_DIR, '**', '*.js'),
  POSTCSS: path.join(POSTCSS_DIR, '*.js')
};

gulp.task('env:set-prod', fn => {
  process.env.NODE_ENV = ENVS.PROD;
  fn();
});

gulp.task('env:set-dev', fn => {
  process.env.NODE_ENV = ENVS.DEV;
  fn();
});

gulp.task('blocks:styles', () => {
  return gulp.src([PATHS.VENDORS, PATHS.COMMON, PATHS.MIXINS, PATHS.BLOCKS_STYLES])
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
    .pipe(gulp.dest(path.join(BUILD_DIR, 'css')))
    .pipe($.if(process.env.NODE_ENV === ENVS.DEV, $.livereload()));
});

gulp.task('blocks:assets', () => {
  return gulp.src([PATHS.BLOCKS_ASSETS, `!${PATHS.SVG_SPRITE}`], { base: SRC_DIR })
    .pipe($.plumber({ errorHandler: notifyOnErrorFactory('Blocks assets') }))
    .pipe($.newer(BUILD_DIR))
    .pipe(gulp.dest(path.join(BUILD_DIR, 'assets')))
    .pipe($.if(process.env.NODE_ENV === ENVS.DEV, $.livereload()));
});

gulp.task('blocks:js', () => {
  return gulp.src(JS_MAIN)
    .pipe($.plumber({ errorHandler: notifyOnErrorFactory('Js') }))
    .pipe(webpackStream(require('./webpack.config')))
    .pipe(gulp.dest(path.join(BUILD_DIR, 'js')))
    .pipe($.if(process.env.NODE_ENV === ENVS.DEV, $.livereload()));
});

gulp.task('blocks', gulp.parallel('blocks:styles', 'blocks:assets', 'blocks:js'));

gulp.task('lint:styles', () => {
  return gulp
    .src(PATHS.BLOCKS_STYLES)
    .pipe($.plumber({ errorHandler: notifyOnErrorFactory('Lint:styles') }))
    .pipe($.stylelint({ reporters: [{ formatter: 'string', console: true }] }));
});

gulp.task('lint:js', () => {
  return gulp
    .src(PATHS.BLOCKS_JS)
    .pipe($.plumber({ errorHandler: notifyOnErrorFactory('Lint:scripts') }))
    .pipe($.eslint())
    .pipe($.eslint.format());
});

gulp.task('lint', gulp.parallel('lint:styles', 'lint:js'));

gulp.task('watch', () => {
  $.livereload.listen();

  gulp.watch(
    [PATHS.VENDORS, PATHS.COMMON, PATHS.MIXINS, PATHS.BLOCKS_STYLES],
    gulp.parallel('blocks:styles', 'lint:styles')
  )
    .on('unlink', filePath => {
      const resolvedFilePath = path.resolve(filePath);
      $.remember.forget('css-remember', resolvedFilePath);

      if ($.cached && $.cached.caches && $.caches['css-cached']) {
        delete $.cached.caches['css-cached'][resolvedFilePath];
      }
    });
  gulp.watch([JS_MAIN, PATHS.BLOCKS_JS], gulp.series('lint:js', 'blocks:js'));
  gulp.watch([PATHS.BLOCKS_ASSETS, `!${PATHS.SVG_SPRITE}`], gulp.series('blocks:assets'));
  gulp.watch(PATHS.POSTCSS).on('change', postcssPath => {
    delete require.cache[postcssPath];
    gulp.series('blocks:styles', 'lint:styles')();
  });
});

function notifyOnErrorFactory(title) {
  return $.notify.onError(err => ({ title: title, message: err.message }));
}

gulp.task('default', gulp.series('env:set-prod', 'lint', 'blocks'));
gulp.task('watch', gulp.series('env:set-dev', 'lint', 'blocks', gulp.parallel('watch')));

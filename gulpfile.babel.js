'use strict';

// import
import gulp from 'gulp';
import source from 'vinyl-source-stream';
import sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import pleeease from 'gulp-pleeease';
import browserify from 'browserify';
import babelify from 'babelify';
import debowerify from 'debowerify';
import pug from 'gulp-pug';
import markdown from 'gulp-markdown';
import frontMatter from 'gulp-front-matter';
import prettify from 'gulp-html-prettify';
import layout from 'gulp-layout';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import decodecode from 'gulp-decodecode';
import browserSync from 'browser-sync';
import readConfig from 'read-config';
import watch from 'gulp-watch';
import RevLogger from 'rev-logger';


// const
const SRC = './src';
const CONFIG = './src/config';
const HTDOCS = './docs';
const BASE_PATH = '';
const DEST = `${HTDOCS}${BASE_PATH}`;

const revLogger = new RevLogger({
    'style.css': `${DEST}/css/style.css`,
    'script.js': `${DEST}/js/script.js`
});


// css
gulp.task('copy-bower-css', () => { 
  return gulp.src(
    [
      'material-design-lite/material.min.css',
      'material-design-lite/material.min.css.map'
    ], {
    cwd: 'bower_components',
  })
    .pipe(gulp.dest(`${DEST}/css/lib`))
  ;
});

gulp.task('sass', () => {
  const config = readConfig(`${CONFIG}/pleeease.json`);
  return gulp.src(`${SRC}/scss/style.scss`)
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(pleeease(config))
    .pipe(gulp.dest(`${DEST}/css`))
  ;
});

// gulp.task('css', gulp.series(gulp.parallel('sass', 'copy-bower-css')));
gulp.task('css', gulp.series('sass'));


// js
gulp.task('copy-bower-js', () => { 
  return gulp.src(
    [
      // 'material-design-lite/material.min.js',
      // 'material-design-lite/material.min.js.map',
      'jquery/dist/jquery.min.js',
      'jquery/dist/jquery.min.map',
      'lodash/dist/lodash.min.js'
    ], {
    cwd: 'bower_components',
  })
    .pipe(gulp.dest(`${DEST}/js/lib`))
  ;
});

gulp.task('browserify', () => {
  return browserify(`${SRC}/js/script.js`)
    .transform(babelify)
    .transform(debowerify)
    .bundle()
    .pipe(source('script.js'))
    .pipe(gulp.dest(`${DEST}/js`))
  ;
});

gulp.task('minify', () => {
  return gulp.src(`${DEST}/js/script.js`)
    .pipe(uglify({
      preserveComments: 'license',
    }))
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest(`${DEST}/js`))
  ;
});

gulp.task('deco', () => {
  return gulp.src(`${DEST}/js/script.js`)
    .pipe(decodecode({
      preserveComments: 'license',
      decoArr: ['b', 'u', 't', 'c', 'h', 'i'],
    }))
    .pipe(rename('script.deco.js'))
    .pipe(gulp.dest(`${DEST}/js`))
  ;
});

// gulp.task 'js', gulp.parallel('browserify', 'copy-bower-js')
gulp.task('js', gulp.series(gulp.parallel('browserify', 'copy-bower-js'), gulp.parallel('minify', 'deco')));


// html
gulp.task('pug', () => {
  const locals = readConfig(`${CONFIG}/meta.yml`);
  locals.versions = revLogger.versions();

  return gulp.src([`${SRC}/pug/**/[!_]*.pug`, `!${SRC}/pug/**/_*/**/*`])
    .pipe(pug({
      locals: locals,
      pretty: true,
      basedir: `${SRC}/pug`,
    }))
    .pipe(gulp.dest(`${DEST}`))
  ;
});

gulp.task('member', () => {
  return gulp.src([`${SRC}/config/members/*.md`], {
    base: `${SRC}/config/members`,
  })
  .pipe(frontMatter({
    remove: true
  }))
  // .pipe(gulp.dest(`${DEST}/members`))
  .pipe(markdown())
  .pipe(layout((file) => {
    return file.frontMatter
  }))
  .pipe(prettify({
    indent_char: "\t",
    indent_size: 1,
  }))
  .pipe(gulp.dest(`${DEST}/members`))
})

gulp.task('html', gulp.series('pug'));


gulp.task('browser-sync' , () => {
  browserSync({
    server: {
      baseDir: HTDOCS
    },
    startPath: BASE_PATH,
    ghostMode: false,
  });

  watch([`${SRC}/scss/**/*.scss`], gulp.series('sass', browserSync.reload));
  watch([`${SRC}/js/**/*.js`], gulp.series('js', browserSync.reload));
  watch([
      `${SRC}/pug/**/*.pug`,
      `${SRC}/config/meta.yml`
  ], gulp.series('pug', browserSync.reload));

  revLogger.watch((changed) => {
      gulp.series('pug', browserSync.reload)();
  });
});

gulp.task('serve', gulp.series('browser-sync'));

gulp.task('build', gulp.parallel('css', 'js', 'html'));
gulp.task('default', gulp.series('build', 'serve'));

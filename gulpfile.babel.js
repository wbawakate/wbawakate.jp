'use strict';

// import
import gulp from 'gulp';
import fs from 'fs';
import _ from 'lodash';
import source from 'vinyl-source-stream';
import sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import pleeease from 'gulp-pleeease';
import browserify from 'browserify';
import babelify from 'babelify';
import pug from 'gulp-pug';
import postman from 'gulp-postman';
import rename from 'gulp-rename';
import rimraf from 'rimraf';
import uglify from 'gulp-uglify';
import decodecode from 'gulp-decodecode';
import browserSync from 'browser-sync';
import readConfig from 'read-config';
import bibtexParse from 'bibtex-parse-js';
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
gulp.task('copy-modules-css', () => { 
  return gulp.src(
    [
      'material-design-lite/material.min.css',
      'material-design-lite/material.min.css.map'
    ], {
    cwd: 'node_modules',
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

// gulp.task('css', gulp.series(gulp.parallel('sass', 'copy-modules-css')));
gulp.task('css', gulp.series('sass'));


// js
gulp.task('copy-modules-js', () => { 
  return gulp.src(
    [
      // 'material-design-lite/material.min.js',
      // 'material-design-lite/material.min.js.map',
      'jquery/dist/jquery.min.js',
      'jquery/dist/jquery.min.map',
      'lodash/lodash.min.js'
    ], {
    cwd: 'node_modules',
  })
    .pipe(gulp.dest(`${DEST}/js/lib`))
  ;
});

gulp.task('browserify', () => {
  return browserify(`${SRC}/js/script.js`)
    .transform(babelify)
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
      decoArr: ['全', '脳', '若', '手'],
    }))
    .pipe(rename('script.deco.js'))
    .pipe(gulp.dest(`${DEST}/js`))
  ;
});

// gulp.task 'js', gulp.parallel('browserify', 'copy-modules-js')
gulp.task('js', gulp.series(gulp.parallel('browserify', 'copy-modules-js'), gulp.parallel('minify', 'deco')));


// html
gulp.task('pug', () => {
  const locals = {
    _: _,
    settings: readConfig(`${CONFIG}/meta.yml`),
    sponsor: readConfig(`${CONFIG}/sponsor.yml`),
    sponsorEvents: readConfig(`${CONFIG}/sponsor-event.yml`),
    events: readConfig(`${CONFIG}/event.yml`),
    members: readConfig(`${CONFIG}/member.yml`),
    newsArr: readConfig(`${CONFIG}/news.yml`),
    versions: revLogger.versions(),
    bibArr: bibtexParse.toJSON(fs.readFileSync(`${CONFIG}/publication.bib`, { encoding:"utf8" })),
  };

  return gulp.src([`${SRC}/pug/**/[!_]*.pug`, `!${SRC}/pug/**/_*/**/*`])
    .pipe(postman({
      markdown: `${SRC}/config/_events/**/*.md`,
      template: `${SRC}/pug/_event/_events.pug`,
      locals,
    }))
    .pipe(postman({
      markdown: `${SRC}/config/_members/**/*.md`,
      template: `${SRC}/pug/_member/_members.pug`,
      locals,
    }))
    .pipe(pug({
      pretty: true,
      basedir: `${SRC}/pug`,
    }))
    .pipe(gulp.dest(`${DEST}`))
  ;
});

gulp.task('rename-member', () => {
  return gulp.src(`${DEST}/_member/**/*`)
    .pipe(rename(function (path) {
      if (path.extname) {
        path.dirname = path.basename;
        path.basename = 'index';
      }
    }))
    .pipe(gulp.dest(`${DEST}/member`))
  ;
});

gulp.task('rename-event', () => {
  return gulp.src(`${DEST}/_member/**/*`)
    .pipe(rename(function (path) {
      if (path.extname) {
        path.dirname = path.basename;
        path.basename = 'index';
      }
    }))
    .pipe(gulp.dest(`${DEST}/event`))
  ;
});

gulp.task('clean', (cb) => {
  rimraf(`${DEST}/_member`, cb)
  rimraf(`${DEST}/_event`, cb)
});

gulp.task('html', gulp.series('pug', gulp.parallel('rename-member', 'rename-event'), 'clean'));


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
      `${SRC}/config/**/*`
  ], gulp.series('html', browserSync.reload));

  revLogger.watch((changed) => {
      gulp.series('pug', browserSync.reload)();
  });
});

gulp.task('serve', gulp.series('browser-sync'));

gulp.task('build', gulp.parallel('css', 'js', 'html'));
gulp.task('default', gulp.series('build', 'serve'));

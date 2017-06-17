'use strict';

// import
import gulp from 'gulp';
import fs from 'fs';
import _ from 'lodash';
import moment from 'moment';
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


// const
const SRC = './src';
const CONFIG = './src/config';
const HTDOCS = './docs';
const BASE_PATH = '';
const DEST = `${HTDOCS}${BASE_PATH}`;


// css
// gulp.task('copy-modules-css', () => { 
//   return gulp.src(
//     [
//       'material-design-lite/material.min.css',
//       'material-design-lite/material.min.css.map'
//     ], {
//     cwd: 'node_modules',
//   })
//     .pipe(gulp.dest(`${DEST}/css/lib`))
//   ;
// });

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
gulp.task('css-test', gulp.series('sass'));


// js
gulp.task('copy-modules-js', () => { 
  return gulp.src(
    [
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

gulp.task('js', gulp.series(gulp.parallel('browserify', 'copy-modules-js'), gulp.parallel('minify', 'deco')));
gulp.task('js-test', gulp.series('browserify', gulp.parallel('minify', 'deco')));


// html
gulp.task('pug', () => {
  const locals = {
    _: _,
    moment: moment,
    settings: readConfig(`${CONFIG}/meta.yml`),
    sponsor: readConfig(`${CONFIG}/sponsor.json`).sheet,
    sponsorEvents: readConfig(`${CONFIG}/sponsor-event.json`).sheet,
    events: readConfig(`${CONFIG}/event.json`).sheet,
    members: readConfig(`${CONFIG}/member.json`),
    newsArr: readConfig(`${CONFIG}/news.yml`),
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
  return gulp.src(`${DEST}/_event/**/*`)
    .pipe(rename(function (path) {
      if (path.extname) {
        path.dirname = path.basename;
        path.basename = 'index';
      }
    }))
    .pipe(gulp.dest(`${DEST}/event`))
  ;
});

gulp.task('copy-scripts', () => { 
  return gulp.src([
    `${SRC}/js/ua-switch.js`
  ])
    .pipe(gulp.dest(`${DEST}/js`))
  ;
});

gulp.task('copy-images', () => { 
  return gulp.src(`${SRC}/images/**/*`)
    .pipe(gulp.dest(`${DEST}/img`))
  ;
});

gulp.task('clean', (cb) => {
  rimraf(`${DEST}/_member`, cb)
  rimraf(`${DEST}/_event`, cb)
});

gulp.task('redirect', () => {
  const redirectLi = readConfig(`${CONFIG}/redirect.yml`);

  let redirectArr = redirectLi.list

  let ret;

  redirectArr.forEach((item) => {
    const locals = item;

    let filename = item.filename || 'index.html';

    ret = gulp.src(`${SRC}/pug/_redirect/index.pug`)
      .pipe(pug({
        locals: locals,
        pretty: true,
        basedir: `${SRC}/pug`,
      }))
      .pipe(rename(filename))
      .pipe(gulp.dest(`${DEST}${item.path}`))
    ;
  });

  return ret;
});

gulp.task('html', gulp.series('redirect', 'pug', gulp.parallel('rename-member', 'rename-event', 'copy-scripts', 'copy-images'), 'clean'));
gulp.task('html-test', gulp.series('pug', 'redirect'));


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
});

gulp.task('serve', gulp.series('browser-sync'));

gulp.task('build', gulp.parallel('css', 'js', 'html'));
gulp.task('test', gulp.parallel('css-test', 'js-test', 'html-test'));
gulp.task('default', gulp.series('build', 'serve'));

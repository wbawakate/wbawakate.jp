// import
import gulp from 'gulp'
import fs from 'fs'
import lodash from 'lodash'
import moment from 'moment'
import source from 'vinyl-source-stream'
import sass from 'gulp-dart-sass'
import sassGlob from 'gulp-sass-glob'
import browserify from 'browserify'
import babelify from 'babelify'
import pug from 'gulp-pug'
import postman from './gulp-postman.js';
import rename from 'gulp-rename'
import browserSync from 'browser-sync'
import readConfig from 'read-config'
import bibtexParse from 'bibtex-parse-js'
import watch from 'gulp-watch'

import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// const
const SRC = './src'
const CONFIG = path.resolve(__dirname, './src/config')
const HTDOCS = './docs'
const BASE_PATH = ''
const DEST = `${HTDOCS}${BASE_PATH}`

// // css
// const taskCopyModulesCss = _ => {
//     return gulp
//         .src(
//             [
//                 'material-design-lite/material.min.css',
//                 'material-design-lite/material.min.css.map',
//             ],
//             {
//                 cwd: 'node_modules',
//             }
//         )
//         .pipe(gulp.dest(`${DEST}/css/lib`))
// }

const taskSass = done => {
    gulp.src(`${SRC}/scss/style.scss`)
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(gulp.dest(DEST + '/css'))
    done()
}

const taskCss = done => {
    const task = gulp.series(taskSass)
    task()
    done()
}
const taskCssTest = done => {
    const task = gulp.series(taskSass)
    task()
    done()
}

// js
const taskCopyModulesJs = done => {
    gulp.src(
        [
            'jquery/dist/jquery.min.js',
            'jquery/dist/jquery.min.map',
            'lodash/lodash.min.js',
        ],
        {
            cwd: 'node_modules',
        }
    ).pipe(gulp.dest(DEST + '/js/lib'))
    done()
}

const taskBrowserify = done => {
    browserify(SRC + '/js/script.js')
        .transform(
            babelify.configure({
                presets: ['@babel/env'],
                sourceType: 'module',
            })
        )
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(DEST + '/js'))
    done()
}

const taskJs = done => {
    const task = gulp.parallel(taskBrowserify, taskCopyModulesJs)
    task()
    done()
}
const taskJsTest = done => {
    gulp.series(taskBrowserify)
    done()
}

// html

const locals = {
    lodash,
    moment,
    settings: readConfig(`${CONFIG}/meta.yml`),
    sponsor: readConfig(`${CONFIG}/sponsor.json`).sheet,
    sponsorEvents: readConfig(`${CONFIG}/sponsor-event.json`).sheet,
    events: readConfig(`${CONFIG}/event.json`).sheet,
    members: readConfig(`${CONFIG}/member.json`),
    newsArr: readConfig(`${CONFIG}/talks.yml`),
    bibArr: bibtexParse.toJSON(
        fs.readFileSync(`${CONFIG}/publication.bib`, { encoding: 'utf8' })
    ),
    unescape: body =>
        // from [JavaScript：unescapeHTMLの妥当な実装: Architect Note](http://blog.tojiru.net/article/211339637.html)
        body
            .replace('&amp;', /&/g)
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'"),
}

const taskPug = done => {
    gulp.src([
        `${SRC}/pug/**/*.pug`,
        `!${SRC}/pug/**/_*.pug`,
        `!${SRC}/pug/**/_*/**/*`,
    ])
        .pipe(postman({
            markdown: `${SRC}/config/member/**/*.md`,
            template: `${SRC}/pug/member/_members.pug`,
            locals,
        }))
        .pipe(postman({
            markdown: `${SRC}/config/event/**/*.md`,
            template: `${SRC}/pug/event/_events.pug`,
            locals,
        }))
        .pipe(postman({
            markdown: `${SRC}/config/sponsor-event/**/*.md`,
            template: `${SRC}/pug/sponsor-event/_sponsor-events.pug`,
            locals,
        }))
        .pipe(
            pug({
                pretty: true,
                basedir: SRC + '/pug',
                locals: locals,
            })
        )
        .pipe(gulp.dest(DEST))
    done()
}

const taskCopyScripts = done => {
    gulp.src([`${SRC}/js/ua-switch.js`]).pipe(gulp.dest(DEST + '/js'))
    done()
}

const taskCopyImages = done => {
    gulp.src(`${SRC}/images/**/*`, { encoding: false }).pipe(
        gulp.dest(DEST + '/img')
    )
    done()
}

const taskCopyData = done => {
    gulp.src(`${SRC}/data/**/*`, { encoding: false }).pipe(
        gulp.dest(DEST + '/data')
    )
    done()
}

const taskCopyStatic = done => {
    gulp.src(`${SRC}/static/**/*`, { encoding: false }).pipe(gulp.dest(DEST))
    done()
}

const taskRedirect = done => {
    const redirectLi = readConfig(CONFIG + '/redirect.yml')

    let redirectArr = redirectLi.list

    let ret

    redirectArr.forEach(item => {
        const locals = item

        let filename = item.filename || 'index.html'

        ret = gulp
            .src(SRC + '/pug/_redirect/index.pug')
            .pipe(
                pug({
                    locals: locals,
                    pretty: true,
                    basedir: SRC + '/pug',
                })
            )
            .pipe(rename(filename))
            .pipe(gulp.dest(DEST + item.path))
    })

    done()

    return ret
}

const taskHtml = done => {
    const task = gulp.series(
        taskRedirect,
        taskPug,
        gulp.parallel(
            taskCopyScripts,
            taskCopyImages,
            taskCopyData,
            taskCopyStatic
        ),
    )
    task()
    done()
}
const taskHtmlTest = _ => gulp.series(taskPug, taskRedirect)

const taskBrowserSync = done => {
    browserSync({
        server: {
            baseDir: HTDOCS,
        },
        startPath: BASE_PATH,
        ghostMode: false,
    })

    watch([`${SRC}/scss/**/*.scss`], gulp.series(taskSass, browserSync.reload))
    watch([`${SRC}/js/**/*.js`], gulp.series(taskJs, browserSync.reload))
    watch(
        [`${SRC}/pug/**/*.pug`, `${SRC}/config/**/*`],
        gulp.series(taskHtml, browserSync.reload)
    )
    done()
}

const taskServe = done => {
    const task = gulp.series(taskBrowserSync)
    task()
    done()
}

const taskBuild = done => {
    const task = gulp.parallel(taskCss, taskJs, taskHtml)
    task()
    done()
}
const taskTest = done => {
    const task = gulp.parallel(taskCssTest, taskJsTest, taskHtmlTest)
    task()
    done()
}
const taskDefault = done => {
    const task = gulp.series(taskBuild, taskServe)
    task()
    done()
}

export { taskHtml as html, taskCss as css, taskJs as js }
export { taskServe as serve }
export { taskBuild as build, taskTest as test }
export default taskDefault

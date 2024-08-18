import path from 'path'
import fs from 'fs'

import gulp from 'gulp'
import through from 'through2'
import gutil from 'gulp-util'
import frontMatter from 'gulp-front-matter'
import marked from 'marked'
import lodash from 'lodash'

const PLUGIN_NAME = 'gulp-postman';

export default opts => {
    opts = opts || {};

    const markdown = opts.markdown;
    const postParams = opts.postParams;
    const template = opts.template;

    const locals = opts.locals;
    const metaProperty = opts.metaProperty || 'meta';
    const bodyProperty = opts.bodyProperty || 'body';
    const frontMatterProperty = opts.frontMatterProperty || 'frontMatter';
    const archiveProperty = opts.archiveProperty || 'archive';
    const markedOpts = opts.markedOpts || {
        breaks: true
    };

    let base;
    const files = [];

    if (!template) {
        this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'no template'));
    }

    const templateSource = fs.readFileSync(template, 'utf8');
    let templateData;

    function transform (file, encoding, callback) {
        if (!base) {
            base = file.base;
        }
        
        // postの元になるテンプレートは、そのままでは使用しない
        if(!path.relative(template, file.path)) {
            templateData = file.data;
            return callback();
        }

        file.data = lodash.assign({}, file.data, locals);
        files.push(file);
        
        return callback();
    };

    function flush (callback) {
        const archive = [];

        const packFiles = () => {
            files.forEach((file) => {
                file.data[archiveProperty] = archive;
                this.push(file);
            });
        };

        const createPostFile = (slug, meta, body='') => {
            const convertPath = path.resolve(path.join(
                path.dirname(template),
                slug,
                'index' + path.extname(template)
            ));
            
            const post = new gutil.File({
                cwd: '.',
                base: base,
                path: convertPath
            });

            meta.slug = slug;
            
            post.contents = Buffer.from(templateSource);
            post.data = lodash.assign({}, templateData, locals);
            post.data[metaProperty] = meta;
            post.data[bodyProperty] = body;
            files.push(post);
                
            archive.push(meta);
        };
        
        if (postParams) {
            lodash.each(postParams, (meta, slug) => {
                createPostFile(slug, meta);
            });
            
            packFiles();
            callback();
            return;
        } else if (markdown) {
            gulp.src(markdown)
                .pipe(frontMatter({
                    property: frontMatterProperty,
                    remove: true
                }))
                .pipe(through.obj((file, encode, callback) => {
                    createPostFile(
                        path.basename(file.path, '.md'),
                        file[frontMatterProperty] || {},
                        marked(file.contents.toString(), markedOpts)
                    );
                    
                    callback();
                }, (cb) => {
                    packFiles();
                    cb();
                    callback();
                }));
        }
    };

    return through.obj(transform, flush);
}

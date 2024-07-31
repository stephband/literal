
import exec            from 'fn/exec.js';
import overload        from 'fn/overload.js';
import toType          from 'fn/to-type.js';
import getAbsoluteFile from '../files/get-absolute-file.js';
import prependComment  from '../files/prepend-comment.js';
import parseMarkdown   from '../parse/parse-markdown.js';
import toExtension     from '../files/to-extension.js';
import read            from '../files/read.js';
import compile         from '../compile.js';
import { rewriteURLs } from '../urls.js';
import imports         from './imports.js';
import * as scope      from '../scope.js';

/**
include(url, data)
Includes a template from `url`, rendering it with properties of `data`
as in-scope variables.
**/

const resolveData = overload(toType, {
    'string': (url, source, target) => {
        return imports(source, target, url);
    },

    'object': (object) => Promise.resolve(object),

    'undefined': () => Promise.resolve(),

    default: (object) => {
        throw new Error('include(url, object) cannot be called with object of type ' + toType(object));
    }
});

function renderFile([source, target, file, data, template, DEBUG, DDD]) {
    const include  = (src, data) => data ?
        scope.include(file, target, src, data, DEBUG) :
        Promise.resolve('') ;
    const comments = (...urls) => comments(file, target, ...urls);
    const render   = compile(scope, 'data, include, imports, comments', template, file, DEBUG);

    return render(data, include, null, comments)
    .then(DEBUG ?
        (text) => prependComment(file, source, rewriteURLs(file, source, text)) :
        (text) => rewriteURLs(file, source, text)
    );
}

const renderInclude = overload((source, target, file) => toExtension(file), {
    '.html.literal': (source, target, file, data, DEBUG) => Promise
        .all([source, target, file, resolveData(data, source, target), read(file).then(extractBody), DEBUG, data])
        .then(renderFile),

    '.literal': (source, target, file, data, DEBUG) => Promise
        .all([source, target, file, resolveData(data, source, target), read(file), DEBUG, data])
        .then(renderFile),

    '.html': (source, target, file) => read(file)
        .then(extractBody)
        .then((html) => rewriteURLs(file, source, html)),

    '.md': (source, target, file) => read(file)
        .then((text) => parseMarkdown(text))
        .then((html) => rewriteURLs(file, source, html)),

    '.css': (source, target, file) => read(file)
        .then((text) => rewriteURLs(file, source, text)),

    '.svg': (source, target, file) => read(file)
        .then((text) => rewriteURLs(file, source, text)),

    // All other files are processed as straight text includes
    'default': (source, target, file) => read(file)
});

function extractBody(html) {
    const pre = /<body[^>]*>/.exec(html);
    if (!pre) { return html; }
    const post = /<\/body\s*>/.exec(html);
    return html.slice(pre.index + pre[0].length, post.index);
}

export default function include(source, target, url, data, DEBUG) {
    // Get absolute OS file path
    const file = getAbsoluteFile(source, url);

    /*
    console.log('====== include(url, scope) ======',
        '\ntarget: ' + target,
        '\nsource: ' + source,
        '\nurl:    ' + url,
        '\nfile:   ' + file
    );
    */

    return renderInclude(source, target, file, data, DEBUG)
    /*.catch((e) => {
        console.log(red + ' ' + yellow, e.constructor.name + ' in', source);
        console.log(red, e.message);
    });*/
};

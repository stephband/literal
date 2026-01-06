
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
import * as scope      from '../scope.js';
import imports         from './imports.js';

import { red, yellow } from '../log.js';

/**
include(url, data)
Includes a template from `url`, rendering it with properties of `data`
as in-scope variables.
**/

const resolveData = overload(toType, {
    'string':    (url, source, target) => imports(source, target, url),
    'object':    (object) => Promise.resolve(object),
    'undefined': () => Promise.resolve(),
    default: (object) => {
        throw new Error('include(url, object) cannot be called with object of type ' + toType(object));
    }
});

function renderFile([source, target, filepath, template, DEBUG, constNames, consts, data]) {
    const includeFn = (src, data) => include(filepath, target, src, DEBUG, constNames, consts, data);
    const comments  = (...urls) => comments(filepath, target, ...urls);
    const render    = compile(scope, 'consts, data, include, comments', constNames, template, filepath, DEBUG);

    return render(consts, data, includeFn, comments)
    .then(DEBUG ?
        (text) => prependComment(filepath, source, rewriteURLs(filepath, source, text)) :
        (text) => rewriteURLs(filepath, source, text)
    );
}

const renderInclude = overload((source, target, filepath) => toExtension(filepath), {
    '.html.literal': (source, target, filepath, DEBUG, constNames, consts, data) => Promise
        .all([source, target, filepath, read(filepath).then(extractBody), DEBUG, constNames, consts, resolveData(data, source, target)])
        .then(renderFile),

    '.literal': (source, target, filepath, DEBUG, constNames, consts, data) => Promise
        .all([source, target, filepath, read(filepath), DEBUG, constNames, consts, resolveData(data, source, target)])
        .then(renderFile),

    '.html': (source, target, filepath) => read(filepath)
        .then(extractBody)
        .then((html) => rewriteURLs(filepath, source, html)),

    '.md': (source, target, filepath) => read(filepath)
        .then((text) => parseMarkdown(text))
        .then((html) => rewriteURLs(filepath, source, html)),

    '.css': (source, target, filepath) => read(filepath)
        .then((text) => rewriteURLs(filepath, source, text)),

    '.svg': (source, target, filepath) => read(filepath)
        .then((text) => rewriteURLs(filepath, source, text)),

    // All other files are processed as straight text includes
    'default': (source, target, filepath) => read(filepath)
});

function extractBody(html) {
    const pre = /<body[^>]*>/.exec(html);
    if (!pre) { return html; }
    const post = /<\/body\s*>/.exec(html);
    return html.slice(pre.index + pre[0].length, post.index);
}

export default function include(source, target, url, DEBUG, constNames, consts = {}, data = {}) {
    // Get absolute OS file path
    const filepath = getAbsoluteFile(source, url);

    /*
    console.log('====== include(url, scope) ======',
        '\ntarget: ' + target,
        '\nsource: ' + source,
        '\nurl:    ' + url,
        '\nDEBUG:  ' + DEBUG,
        '\nfile:   ' + filepath,
        '\nconsts: { ' + constNames + ' } = ' + (typeof consts),
        '\ndata:   ' + (typeof data)
    );
    /**/

    return renderInclude(source, target, filepath, DEBUG, constNames, consts, data)
    .catch((e) => {
        console.log(red + ' ' + yellow, e.constructor.name + ' in', source);
        console.log(red, e.message);
        return '';
    });
}

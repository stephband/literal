
import * as path from "https://deno.land/std@0.110.0/path/mod.ts";

// Absolute path to module
const moduleAbs = path.dirname(path.fromFileUrl(import.meta.url));

import { addDate } from 'fn/date.js';
import { addTime } from 'fn/time.js';
import exec        from 'fn/exec.js';
import get         from 'fn/get.js';
import overload    from 'fn/overload.js';
import toType      from 'fn/to-type.js';

import read            from './read.js';
import { rewriteURL, rewriteURLs } from './url.js';
import compile         from './compile.js';
import comments        from './comments.js';

import parseMarkdown   from './parse-markdown.js';

import { red, yellow }     from './log.js';

export * from '../scope/scope-fns.js';
export * from '../scope/scope-fns-ext.js';
export { px, em, rem } from './parse-length.js';
export const vw = () => { throw new Error('Literal scope function vw() not available in Deno') }
export const vh = () => { throw new Error('Literal scope function vh() not available in Deno') }
export { comments };
export { parseMarkdown as markdown };


const assign      = Object.assign;
const toExtension = exec(/\.[\w\d.]+$/, get(0));
const rabsolute   = /^https?:\/\//;


/**
imports(url)
Imports all exports of a JS module or JSON file.
**/

// TextDecoder decodes the Uint8Array to unicode text
const decoder = new TextDecoder('utf-8');

const imports = overload((source, target, url) => toExtension(url), {
    '.js': (source, target, url) => {
        // Current directory absolute
        const currentAbs  = Deno.cwd() + '/';
        // Source dir relative to current working directory
        const sourcedir   = path.dirname(source);
        // Resource path relative to current working directory
        const resource    = path.join(sourcedir, url);
        // Resource path absolute
        const resourceAbs = path.join(currentAbs, resource);
        // Resource path relative to module
        const resourceRel = path.relative(moduleAbs, resourceAbs);

        return import(resourceRel);
    },

    '.json': (source, target, url) => {
        // Current directory absolute
        const currentAbs  = Deno.cwd() + '/';
        // Source dir relative to current working directory
        const sourcedir   = path.dirname(source);
        // Resource path relative to current working directory
        const resource    = path.join(sourcedir, url);
        // Resource path absolute
        //const resourceAbs = path.join(currentAbs, resource);
        // Resource path relative to module
        //const resourceRel = path.relative(moduleAbs, resourceAbs);

//console.log('RRRR', currentAbs);
//console.log('RRRR', sourcedir);
//console.log('RRRR', resource);
//console.log('RRRR', resourceAbs);
//console.log('RRRR', resourceRel);

        return Deno.readFile(resource)
        .then((array) => decoder.decode(array))
        .then(JSON.parse);
    },

    'undefined': overload((source, target, url) => rabsolute.test(url), {
        // Is absolute URL
        true: (source, target, url) => fetch(url)
            .then((response) => response.text())
            .then(JSON.parse),

        // Is local file
        default: (source, target, url) => {
            // Source dir relative to current working directory
            const sourcedir = path.dirname(source);
            // Resource path relative to current working directory
            const resource  = path.join(sourcedir, url);

            return Deno.readFile(resource)
            .then((array) => decoder.decode(array))
            .then(JSON.parse);
        }
    }),

    default: (source, target, url) => {
        throw new TypeError('File extension ".'
            + toExtension(url)
            + '" not supported by imports("' + url + '")'
        );
    }
});


/**
include(url, data)
Includes a template from `url`, rendering it with properties of `data`
as in-scope variables.
**/

const resolveScope = overload(toType, {
    'string': (url, source, target) => {
        return imports(source, target, url);
    },

    'object': (object) => Promise.resolve(object),

    'undefined': () => Promise.resolve(),

    default: (object) => {
        throw new Error('include(url, object) cannot be called with object of type ' + toType(object));
    }
});

function extractBody(html) {
    const pre = /<body[^>]*>/.exec(html);
    if (!pre) { return html; }
    const post = /<\/body\s*>/.exec(html);
    return html.slice(pre.index + pre[0].length, post.index);
}

export function getAbsoluteFile(source, src) {
    const root     = path.parse(source);
    const dir      = root.dir;
    const relative = src.replace(/#.*$/, '');
//console.log(root, dir, relative);
    return path.join(dir, relative);
}

export function prependComment(source, target, string) {
    return (target.endsWith('.css') || target.endsWith('.js')) ?
        '/* Literal template "' + source + '" */\n' + string.replace(/^\s*, ''/) :
    target.endsWith('.html') ?
        string.replace(/^\s(\<\!DOCTYPE html\>)?/, ($0, doctype) =>
            (doctype ? doctype + '\n' : '') +
            '<!-- Literal template "' + source + '" -->\n'
        ) :
    string ;
}

const renderInclude = overload((source, target, file) => toExtension(file), {
    '.html.literal': (source, target, file, scope) => Promise
        .all([
            resolveScope(scope, source, target),
            read(file).then(extractBody)
        ])
        .then(([data, template]) => {
            const include  = (src, data) => scope.include(file, target, src, data);
            const imports  = (src)       => scope.imports(file, target, CanvasRenderingContext2D);
            const comments = (...urls)   => comments(file, target, ...urls);
            const renderer = {
                source: file,
                render: compile(scope, 'data, include, imports, comments', template, file)
            };

            return renderer
            .render(data, include, imports, comments)
            .then(scope.DEBUG ?
                (text) => prependComment(file, source, rewriteURLs(file, source, text)) :
                (text) => rewriteURLs(file, source, text)
            );
        }),

    '.literal': (source, target, file, scope) => Promise
        .all([
            resolveScope(scope, source, target),
            read(file)
        ])
        .then(([data, template]) => {
            const include  = (src, data) => scope.include(file, target, src, data);
            const imports  = (src)       => scope.imports(file, target, src);
            const comments = (...urls)   => comments(file, target, ...urls);
            const renderer = {
                source: file,
                render: compile(scope, 'data, include, imports, comments', template, file)
            };

            return renderer
            .render(data, include, imports, comments)
            .then(scope.DEBUG ?
                (text) => prependComment(file, source, rewriteURLs(file, source, text)) :
                (text) => rewriteURLs(file, source, text)
            );
        }),

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

export function include(source, target, url, scope) {
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

    return renderInclude(source, target, file, scope)
    .catch((e) => {
        console.log(red + ' ' + yellow, e.constructor.name + ' in', source);
        console.log(red, e.message);
    });
};


/**
add(number|date|time)

Adds `n` to value. Behaviour is overloaded to accept various types of 'n'.
Where `n` is a number, it is summed with value. So to add 1 to any value:

```html
${ pipe(add(1), data.number) }
```

Where 'n' is a duration string in date-like format, value is expected to be a
date and is advanced by the duration. So to advance a date by 18 months:

```html
${ pipe(add('0000-18-00'), data.date) }
```

Where 'n' is a duration string in time-like format, value is expected to be a
time and is advanced by the duration. So to put a time back by 1 hour and 20
seconds:

```html
${ pipe(add('-01:00:20'), data.time) }
```
**/

function toAddType(n) {
    const type = typeof n;
    return type === 'string' ?
        /^\d\d\d\d(?:-|$)/.test(n) ? 'date' :
        /^\d\d(?::|$)/.test(n) ? 'time' :
        'string' :
    type;
}

export const add = overload(toAddType, {
    'date': addDate,
    'time': addTime,
    'string': (a) => (b) => b + a,
    'number': (a) => (b) => b + a,
    'default': function(n) {
        throw new Error('add(value) does not accept values of type ' + typeof n);
    }
});






/**
render(array, param)
**/


import renderString        from '../modules/renderer/to-text.js';

const join = (strings) => strings.join('');
const isPromise = (object) => object && object.then;

function stringify(value, string) {
    return value && typeof value === 'object' ? (
        // If expression returns a promise
        value.then ? value.then((value) => string + value) :
        // If expression returns an array with promises
        value.join ? value.find(isPromise) ?
            // Resolve promises and join to string
            Promise.all(value).then((strings) => string + strings.map(renderString).join('')) :
            // Otherwise join to string immediately
            string + value.map(renderString).join('') :
        // pass any other value to renderString
        string + renderString(value)
    ) :
    string + renderString(value) ;
}

export function render(strings) {
    return Promise.all(
        strings.map((string, i) => (i + 1 < arguments.length ?
            stringify(arguments[i + 1], string) :
            string
        ))
    )
    .then(join);
}




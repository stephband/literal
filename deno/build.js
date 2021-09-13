
import * as path     from "https://deno.land/std@0.106.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.106.0/fs/mod.ts";

import read    from './read.js';
import compile from './compile.js';
import library, { prependComment } from './library.js';
import { rewriteURL, rewriteURLs } from './url.js';
import { dimyellow } from './log.js';

/**
build(source, target, data)
**/

export default function build(source, target, debug) {
    // Declare DEBUG in template scope
    library.DEBUG = debug;

    return read(source)
    .then((template) => {
        const include  = (url, data) => library.include(source, target, url, data);
        const imports  = (url)       => library.imports(source, target, url);
        const comments = (...urls)   => library.comments(source, target, ...urls);
        const renderer = {
            source: source,
            render: compile(library, 'data, include, imports, comments', template, source)
        };

        return renderer
        .render({}, include, imports, comments)
        .then(library.DEBUG ?
            (text) => prependComment(source, target, rewriteURLs(source, target, text)) :
            (text) => rewriteURLs(source, target, text)
        );
    })
    .catch((e) => {
        e.message += ' in template ' + source;
        throw e;
    })
    .then((text) => new Promise(function(resolve, reject) {
        const root = path.parse(target);
        const dir  = root.dir;

        // If dir not '' create a directory tree where one does not exist
        if (dir) {
            ensureDir(dir);
        }

        // Write to target file
        Deno
        .writeTextFile(target, text)
        .then(resolve)
        .catch(reject);
    }))
    /*.then((text) => {
        const filesize = Math.round(Buffer.byteLength(text, 'utf8') / 1000);
        console.log(dimyellow, 'Literal', 'write', target + ' (' + filesize + 'kB)');
        return text;
    });*/
}

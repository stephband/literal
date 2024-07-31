
import * as path       from "https://deno.land/std@0.110.0/path/mod.ts";
import { ensureDir }   from "https://deno.land/std@0.110.0/fs/mod.ts";

import read            from './files/read.js';
import prependComment  from './files/prepend-comment.js';
import compile         from './compile.js';
import * as scope      from './scope.js';
import { rewriteURLs } from './urls.js';
import { dimyellow }   from './log.js';


/**
build(source, target, debug)
**/

export default function build(source, target, DEBUG) {
    // Declare DEBUG in template scope
    //scope.DEBUG = debug;
    return read(source)
    .then((template) => {
        const include  = (url, data) => data ?
            scope.include(source, target, url, data, DEBUG) :
            Promise.resolve('') ;
        const comments = (...urls)   => scope.comments(source, target, ...urls);
        const render   = compile(scope, 'data, include, imports, comments', template, source, DEBUG);

        return render({}, include, null, comments)
        .then(DEBUG ?
            // TODO: prependComment should not be in scope
            (text) => prependComment(source, target, rewriteURLs(source, target, text)) :
            (text) => rewriteURLs(source, target, text)
        );
    })
    .catch((e) => {
        e.message += ' in template ' + source.replace(Deno.cwd() + '/', '');
        throw e;
    })
    .then((text) => {
        const root = path.parse(target);
        const dir  = root.dir;

        // If dir not '' create a directory tree where one does not exist
        if (dir) { ensureDir(dir); }

        // Write to target file
        return Deno.writeTextFile(target, text.trim());
    });
}

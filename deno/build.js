
import * as path     from "https://deno.land/std@0.110.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.110.0/fs/mod.ts";

import read    from './read.js';
import compile from './compile.js';
import * as scope from './scope.js';
import { rewriteURLs } from './url.js';
import { dimyellow } from './log.js';

/**
build(source, target, debug)
**/

export default function build(source, target, debug) {
    // Declare DEBUG in template scope
    //scope.DEBUG = debug;

    return read(source)
    .then((template) => {
        const include  = (url, data) => scope.include(source, target, url, data);
        const imports  = (url)       => scope.imports(source, target, url);
        const comments = (...urls)   => scope.comments(source, target, ...urls);
        const renderer = {
            source: source,
            render: compile(scope, 'data, include, imports, comments', template, source)
        };

        return renderer
        .render({}, include, imports, comments)
        .then(scope.DEBUG ?
            // TODO: prependComment should not be in scope
            (text) => scope.prependComment(source, target, rewriteURLs(source, target, text)) :
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
    })
}

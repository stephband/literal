
import * as path     from "https://deno.land/std@0.98.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.98.0/fs/mod.ts";

import read    from './read.js';
import Literal from './literal.js';
import { dimyellow } from './log.js';

/**
build(source, target, data)
**/

const encoder = new TextEncoder('utf-8');

export default function build(source, target, DEBUG) {
    return read(source)
    .then((template) => Literal(DEBUG, template, source))
    .then((render) => render({}, target))
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


import * as Path from "https://deno.land/std@0.110.0/path/mod.ts";

import overload        from 'fn/overload.js';
import getExtension    from '../modules/get-extension.js';
import getAbsolute     from './get-absolute.js';
import { red, yellow } from './log.js';

// Absolute path to module
const cwd         = Deno.cwd();
const moduleAbs   = Path.dirname(Path.fromFileUrl(import.meta.url));
const rabsolute   = /^https?:\/\//;


/**
imports(src)
Imports all exports of a JS module or JSON file.
**/

// TextDecoder decodes the Uint8Array to unicode text
const decoder = new TextDecoder('utf-8');

export default overload((src, path) => getExtension(src), {
    '.js': (src, path) => {
        // Current directory absolute
        const currentAbs  = cwd + '/';
        // Source dir relative to current working directory
        const sourcedir   = Path.dirname(source);
        // Resource path relative to current working directory
        const resource    = Path.join(sourcedir, src);
        // Resource path absolute
        const resourceAbs = Path.join(currentAbs, resource);
        // Resource path relative to module
        const resourceRel = Path.relative(moduleAbs, resourceAbs);

        return import(resourceRel);
    },

    '.json': (src, path) => {
        const file = getAbsolute(path, src);

        return Deno.readFile(file)
        .then((array) => decoder.decode(array))
        .then(JSON.parse);
    },

    'undefined': overload((src, path) => rabsolute.test(src), {
        // Is absolute URL
        true: (src, path) => fetch(src)
            .then((response) => response.text())
            .then(JSON.parse),

        // Is local file
        default: (src, path) => {
            // Source dir relative to current working directory
            const sourcedir = Path.dirname(path);
            // Resource path relative to current working directory
            const resource  = Path.join(sourcedir, src);

            return Deno.readFile(resource)
            .then((array) => decoder.decode(array))
            .then(JSON.parse);
        }
    }),

    default: (src, path) => {
        throw new TypeError('File extension ".'
            + getExtension(src)
            + '" not supported by imports("' + src + '")'
        );
    }
});

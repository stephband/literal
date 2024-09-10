
import * as path from "https://deno.land/std@0.110.0/path/mod.ts";
import overload    from 'fn/overload.js';
import toExtension from '../files/to-extension.js';


/**
imports(url)
Imports all exports of a JS module or JSON file.
**/

// TextDecoder decodes the Uint8Array to unicode text
const decoder = new TextDecoder('utf-8');

export default overload((source, target, url) => toExtension(url), {
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


/*
Find .xxx.literal template files and build them to .xxx files.
*/

// Directories
const workingdir = Deno.cwd() + '/';

import select  from './select-js.js';
import { yellow, dimyellow, red, dim, green } from './log.js';
import build from './build-comments.js';

if (Deno.args.length < 1) {
    throw new Error("node index.js requires argument 'source.html.literal'");
}

const base   = Deno.args[0] === 'debug' ? '.' : (Deno.args[0] || '');
const dest   = Deno.args[1] === 'debug' ? ''  : (Deno.args[1] || '');
const source = Deno.args[2] === 'debug' ? ''  : (Deno.args[2] || '');
const DEBUG  = Deno.args.find((arg) => (arg === 'debug'));

const files  = await select(workingdir);

Promise.all(
    files.map(function processFile(file) {
        // Build in place... Todo: allow alternative target destination
        //const source = file.path + file.name;
        const target = dest + file.name.replace(/\.\w+$/, '.md');

        return build(source, target, file.path + file.name, DEBUG)
        .then(() => console.log(dim + green, 'Built ', target));
    })
)
.then(() => { Deno.exit(0); })
.catch((e) => {
    throw e;
});

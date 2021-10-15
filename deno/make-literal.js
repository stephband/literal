
/*
Find .xxx.literal template files and build them to .xxx files.
*/

// Directories
const workingdir = Deno.cwd() + '/';

import select  from './select.js';
import { yellow, dimyellow, red, dim, green } from './log.js';
import build from './build.js';

if (Deno.args.length < 2) {
    throw new Error("node index.js requires arguments 'source.html.literal' 'target.html'");
}

const base  = Deno.args[0] === 'debug' ? '.' : (Deno.args[0] || '');
const dest  = Deno.args[1] === 'debug' ? '' : (Deno.args[1] || '');
const DEBUG = Deno.args.find((arg) => (arg === 'debug'));

const files = await select(workingdir);

Promise.all(
    files.map(function processFile(file) {
        // Build in place... Todo: allow alternative target destination
        const source = file.path + file.name;
        const target = file.path + file.name.replace(/\.literal$/, '');
    
        return build(source, target, DEBUG)
        .then(() => console.log(dim + green, 'Built ', target));
    })
)
.then(() => { Deno.exit(0); })
.catch((e) => {
    throw e;
});

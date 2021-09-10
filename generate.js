
/*
Find .xxx.literal template files and build them to .xxx files.
*/

// Directories
const workingdir = Deno.cwd() + '/';

import select  from './deno/select.js';
import { yellow, dimyellow, red, dim } from './deno/log.js';
import build from './deno/build.js';

if (Deno.args.length < 2) {
    throw new Error("node index.js requires arguments 'source.html.literal' 'target.html'");
}

const base  = Deno.args[0] === 'debug' ? '.' : (Deno.args[0] || '');
const dest  = Deno.args[1] === 'debug' ? '' : (Deno.args[1] || '');
const DEBUG = Deno.args.find((arg) => (arg === 'debug'));

const files = await select(workingdir);

files.forEach(function processFile(file) {
    // Build in place... Todo: allow alternative target destination
    const source = file.path + file.name;
    const target = file.path + file.name.replace(/\.literal$/, '');

    build(source, target, DEBUG)
    //.then(() => { Deno.exit(0); })
    .catch((e) => {
        console.log(e);
        Deno.exit(1);
    });
});

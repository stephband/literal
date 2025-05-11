
/*
Find .xxx.literal template files and build them to .xxx files.
*/

// Directories
const workingdir = Deno.cwd() + '/';

import './deno-2-support.js';
import select from './files/select.js';
import build  from './build.js';
import { dim, green } from './log.js';

if (Deno.args.length < 1) throw new Error("node index.js requires argument 'source.html.literal'");

const DEBUG = Deno.args.indexOf('debug') !== -1;
const files = await select(workingdir);

Promise
.all(files.map(function processFile(file) {
    // Build in place... Todo: allow alternative target destination
    const source = file.path + file.name;
    const target = file.path + file.name.replace(/\.literal$/, '');

    return build(source, target, !!DEBUG)
    .then(() => console.log(dim + green, 'Built ', target));
}))
.then(() => Deno.exit(0));

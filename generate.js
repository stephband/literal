
/*
Find .xxx.literal template files and build them to .xxx files.
*/

// Directories
const workingdir = Deno.cwd() + '/';
//const moduledir  = new URL('.', import.meta.url).pathname;

// Arguments
//const args      = Deno.args;
//const builddir  = args[0] || '';
//const modules   = args.slice(1) || '';

import select  from './deno/select.js';
import request from './node/request.js';
import { yellow, dimyellow, red, dim } from './node/log.js';
//import build from './node/build.js';


if (Deno.args.length < 2) {
    throw new Error("node index.js requires arguments 'source.html.literal' 'target.html'");
}

const base  = Deno.args[0] === 'debug' ? '.' : (Deno.args[0] || '');
const dest  = Deno.args[1] === 'debug' ? '' : (Deno.args[1] || '');
const DEBUG = Deno.args.find((arg) => (arg === 'debug'));


function processFile() {
    const parts  = /(.*\/)?([^\s\/]+)\.([\w\d-]+)\.literal$/.exec(source);
    if (!parts) { return; }

    const path = parts[1];
    const name = parts[2];
    const ext  = parts[3];

    // Build in place... Todo: allow alternative target destination
    const target = (path || '') + name + '.' + ext;

    build(source, target, { DEBUG: DEBUG })
    //.then(() => { process.exit(0); })
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
}



const whitelist = ['elements'];

const files = await select({
    matchfile: (name) => /\.literal$/.test(name),
    matchdir:  (name) => whitelist.includes(name)
}, workingdir);

console.log.apply(console, files);


/*
request('./package.json')
.then(JSON.parse)
.then((pkg) => {
    const ignores = pkg.literal && pkg.literal.exclude;

    finder(base)
    .on('directory', function (dir, stat, stop) {
        var base = new URL('.', dir).pathname;
console.log(base);

        // Remove trailing '/' or '/*' from ignore
        if (ignores.find((ignore) => dir.startsWith(ignore.replace(/\/\*?$/, '')))) {
            //console.log(yellow, 'Ignoring', dir + '/');
            stop();
            return;
        }
    })
    .on('file', function (source, stat) {
        // Ignore files that do not match *.xxx.literal
        const parts  = /(.*\/)?([^\s\/]+)\.([\w\d-]+)\.literal$/.exec(source);
        if (!parts) { return; }

        const path = parts[1];
        const name = parts[2];
        const ext  = parts[3];

        // Build in place... Todo: allow alternative target destination
        const target = (path || '') + name + '.' + ext;

        build(source, target, { DEBUG: DEBUG })
        //.then(() => { process.exit(0); })
        .catch((e) => {
            console.log(e);
            process.exit(1);
        });
    });
});
*/
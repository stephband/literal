
import { dimyellowdim } from './log.js';
import { readJSON } from './read.js';

const workingdir = Deno.cwd() + '/';
const defaultConfig = {
    excludes: ['node_modules/']
};

var n = 0;

function readClosest(path, name) {
    // Drill up through to workingdir looking for file called `name`. If such
    // a file is not found resolve to undefined
    return readJSON(path + name).catch(() => {
        return path === workingdir ?
            defaultConfig :
            readClosest(path.replace(/[\w-\.\s]+\/$/, ''), name) ;
    });
}

export default async function select(path) {
    const files  = [];
    const config = await readClosest(path, 'literal.json');

    for await (const entry of Deno.readDir(path)) {
        // Ignore hidden files and directories
        if (entry.name[0] === '.') {
            continue;
        }

        const pathname = path + entry.name;

        // Is entry a file with an extension of the form .js ?
        if (entry.isFile && (/\.js$/.test(pathname))) {
            entry.path = path;
            files.push(entry);
        }

        // Is entry a directory, one that is not excluded by config ?
        else if (entry.isDirectory && (!config.excludes || !config.excludes.find((pattern) => (pathname + '/').includes(pattern)))) {
            files.push.apply(files, await select(pathname + '/'));
        }
    }

    return files;
}

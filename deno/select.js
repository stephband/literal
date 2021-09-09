
import { readJSON } from './read.js';
import noop from '../../fn/modules/noop.js';

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
            readClosest(path.replace(/\w*\/$/, ''), name) ;
    });
}

export default async function select(selector, path) {
    const files  = [];
    const config = await readClosest(path, 'literal.json');

    for await (const entry of Deno.readDir(path)) {
        // Ignore hidden files and directories
        if (entry.name[0] === '.') {
            continue;
        }

        // Is entry a file?
        if (entry.isFile && (!selector.matchfile || selector.matchfile(path + entry.name))) {
            entry.path = path;
            files.push(entry);
            continue;
        }

        // Is entry a non-hidden directory, one that is not blacklisted?
        const dirpath = path + entry.name + '/';
        if (entry.isDirectory && (!config.excludes || !config.excludes.find((pattern) => dirpath.includes(dirpath)))) {
            console.log('DIR', path + entry.name + '/', config.excludes);
            if (++n > 5) { throw new Error('STOP'); }
            files.push.apply(files, await select(selector, path + entry.name + '/'));
        }
    }

    return files;
}

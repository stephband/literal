
/**
read(pathname)
**/

import cache    from '../../fn/modules/cache.js';
import { dimbluedim } from './log.js';

// TextDecoder decodes the Uint8Array to unicode text
const decoder = new TextDecoder('utf-8');

export const readText = cache(function request(source) {
    return Deno.readFile(source)
    .then((array) => decoder.decode(array));
    /*
        Deno.readFile(path), { encoding: 'utf8' }, (err, text) => {
            if (err) {
                //console.log(red + ' ' + yellow, 'Not found', path);
                return reject(err);
            }

            if (window.DEBUG) {
                const filesize = Math.round(Buffer.byteLength(text, 'utf8') / 1000);
                console.log(dimbluedim, 'Literal', 'read', path + ' (' + filesize + 'kB)');
            }

            return resolve(text) ;
        });
    });
    */
});

export const readJSON = cache(function request(source) {
    return readText(source).then(JSON.parse);
});

export default readText;

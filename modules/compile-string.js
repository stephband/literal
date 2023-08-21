
// Todo: This script used by bolt/elements/slide-show... can we refactor that out?

import library from './library.js';
import compile from './compile.js';

/**
compileString()
**/

export default function compileString(string) {
    // library, varstring, string, id, consts = 'data'
    return compile(library, 'data', string);
}

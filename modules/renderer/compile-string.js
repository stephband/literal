
// Todo: This script used by bolt/elements/slide-show... can we refactor that out?

import scope   from '../scope.js';
import compile from './compile.js';

/**
compileString()
**/

export default function compileString(string) {
    return compile(scope, 'data', string);
}

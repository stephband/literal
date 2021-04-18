
import library from './lib.js';
import { compileValueRender } from './compile.js';


/** 
compileValue()
**/

export function compileValue(string) {
    return compileValueRender(library, '', string, 'arguments[1]');
}

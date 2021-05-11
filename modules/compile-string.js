
import library from './lib.js';
import { compileValueRender } from './compile.js';


/** 
compileValue()
**/

export default function compileValue(string) {
    return compileValueRender(library, '', string, 'arguments[1]');
}

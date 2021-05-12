
import library from './lib.js';
import { compileValueRender } from './compile.js';


/** 
compileString()
**/

export default function compileString(string) {
    return compileValueRender(library, '', string, 'arguments[1]');
}

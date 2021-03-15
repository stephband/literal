
import library from '../../bolt/literal/modules/lib.js';
import { compileValueRender } from '../../bolt/literal/modules/compile.js';

const DEBUG = window.DEBUG === true;


/** 
compileValue()
**/

export function compileValue(string) {
    return compileValueRender(library, '', string, 'arguments[1]');
}

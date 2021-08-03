
/* Scope functions */

import by              from '../../fn/modules/by.js';
import equals          from '../../fn/modules/equals.js';
import matches         from '../../fn/modules/matches.js';
import get             from '../../fn/modules/get-path.js';
import noop            from '../../fn/modules/noop.js';
import slugify         from '../../fn/modules/slugify.js';
import last            from '../../fn/modules/last.js';
import overload        from '../../fn/modules/overload.js';
import { observe, getTarget }     from './observer.js';
import px, { em, rem } from './parse-length.js';

function toHTML(object) {
    // Print different kinds of objects differently
    if (typeof object === 'object' && object.template) {
        return '<strong>' + object.id + '.' + object.count + '</strong> #' + object.template;
    }
    
    if (typeof object === 'object') {
        return '<code><strong>' + object.constructor.name + '</strong> ' + JSON.stringify(object) + '</code>';
    }
}

const library = {
    assign: Object.assign,
    by,
    define: Object.defineProperties,
    entries: Object.entries,
    em,
    equals,
    get,
    keys: Object.keys,
    last,
    matches,
    noop,
    observe,
    overload,
    print: window.DEBUG ?
        function print(object) {
            // Print renderer
            const pre = document.createElement('pre');
            pre.setAttribute('class', 'literal-debug-message');
            let html = '', n = -1;
            while (arguments[++n] !== undefined) {
                html += toHTML(getTarget(arguments[n]));
            }
            pre.innerHTML = html;
            return pre;
        } :
        noop,
    px,
    rem,
    slugify,
    values: Object.values,

    // The principal render function
    render: function() {
        // Wait for user-side promises to resolve before sending to render
        return arguments;
    }
};

export default library;

export function register(name, fn) {
    if (library[name]) {
        throw new Error('Literal: function "' + name + '" already registered');
    }

    library[name] = fn;

    // Allow registered fns to be exported directly from their modules    
    return fn;
}

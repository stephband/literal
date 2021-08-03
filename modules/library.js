
/* Scope functions */

import by              from '../../fn/modules/by.js';
import equals          from '../../fn/modules/equals.js';
import matches         from '../../fn/modules/matches.js';
import get             from '../../fn/modules/get-path.js';
import noop            from '../../fn/modules/noop.js';
import slugify         from '../../fn/modules/slugify.js';
import last            from '../../fn/modules/last.js';
import overload        from '../../fn/modules/overload.js';
import { observe }     from './observer.js';
import px, { em, rem } from './parse-length.js';

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
    print: DEBUG ?
        function print(object) {
            // Print renderer
            const pre = document.createElement('pre');
            pre.setAttribute('class', 'literal-debug-message');

            // Print different kinds of objects differently
            if (typeof object === 'object' && object.template) {
                pre.innerHTML = '<strong>' + object.id + '.' + object.count + '</strong> #' + object.template;
            }
            else if (typeof object === 'object') {
                pre.innerHTML = object.constructor.name + ' ' + JSON.stringify(object);
            }

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

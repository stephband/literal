
import compileFn  from 'fn/compile.js';
import { log }    from '../log.js';

const indent = window.DEBUG ? '\n    ' : '' ;

/**
compile(source, scope, consts)
compile(source, scope, consts, options, debug)
Compiles a literal template string `source` to a function that, when called,
runs in a scope with all the properties of `scope` defined as constants. `debug`
is an optional debug string.
(`options.nostrict = true` enables template rendering `with(data)`.)
**/

// Store render functions against their source
export const compiled = {};

// By default compiled functions are not in 'strict mode' so we COULD use with(),
// and make `${ data.name }` available as simply `${ name }` in a template...
// but there be dragons:
//
// 1. MDN says `with` should be considered deprecated. I really don't see
// how they can remove it, though:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with
//
// 2. Accessing a not-defined property via `with(data)` does not appear to
// be reflected in the `data` proxy get records where the property is not
// defined. This is bad, because that property won't flag the renderer for
// rerendering.
//
// 3.Arrays and other objects have their entire prototype chain exposed,
// so `map()`, `filter()` and stuff can be called on the array, which is
// weird, and probably bad. If we are going to use nostrict mode it would
// probably be best to devise some way of enforcing the base data object to
// be a prototype-less object of some sort.
//
// For these reasons we apply `"use strict";` by default.

export default function compile(source, scope, consts, options = {}, debug) {
    const code = (options.consts && options.consts.length ?
            indent + 'const {' + options.consts.join(',') + '} = DATA;' :
            '' )
        + indent + (options.nostrict ? 'with(data) ' : '')
        + 'return args`' + source + '`;\n';

    // Return cached fn
    if (compiled[code]) return compiled[code];

    if (window.DEBUG) {
        const t0 = window.performance.now();
        const fn = compileFn(scope, '{' + consts.join(',') + '}', code, null, !options.nostrict);
        const t1 = window.performance.now();

        // Log this compile
        log('compile', (t1 - t0).toPrecision(3) + 'ms – ' + debug, undefined, undefined, 'yellow');

        // Add fn to cache
        return compiled[code] = fn;
    }

    // The quick version scope, parameters, code, context, strict
    return compiled[code] = compileFn(scope, '{' + consts.join(',') + '}', code, null, !options.nostrict);
}

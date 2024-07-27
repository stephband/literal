
import compileFn  from '../../../fn/modules/compile.js';
import { log }    from '../log.js';

const indent = window.DEBUG ? '\n    ' : '' ;

/**
compile(source, scope, consts, options)
Compiles a literal template string to a function.

(`options.nostrict = true` enables template rendering `with(data)`.)
**/

// Store render functions against their source
export const compiled = {};

export default function compile(source, scope, consts, options = {}, message) {
    // Hey hey, we are not in 'strict mode' inside compiled functions by default
    // so we CAN use with(), making `${ data.name }` available as simply `${ name }`
    // in a template... but let's make it opt-in (for the moment at least). There
    // be dragons:
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
    const code = indent + (options.nostrict ? '' : '"use strict";')
        + indent + 'const {' + consts.join(',') + '} = arguments[0];'
        + indent + (options.nostrict ? 'with(data) ' : '')
        + 'return this.compose`' + source + '`;\n';

    // Return cached fn
    if (compiled[code]) { return compiled[code]; }

    if (window.DEBUG) {
        const t0 = window.performance.now();
        const fn = compileFn(scope, '', code);
        const t1 = window.performance.now();

        // Log this compile
        log('compile', (t1 - t0).toPrecision(3) + 'ms – ' + message, undefined, undefined, 'yellow');

        // Add fn to cache
        return compiled[code] = fn;
    }

    // The quick version
    return compiled[code] = compileFn(scope, '', code);
}

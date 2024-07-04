
import compileFn  from '../../../fn/modules/compile.js';
import { log }    from '../log.js';
import { indent } from './constants.js';

/**
compile(source, scope, parameters, message, options)
Compiles a literal template string to a function.

(`options.nostrict = true` enables template rendering `with(data)`.)
**/

// Store render functions against their source
export const compiled = {};

// Last param, message, is for logging/throwing message
export default function compile(source, scope, parameters, message = '', options = {}) {
    // Hey hey, we are not in 'strict mode' inside compiled functions by default
    // so we CAN use with(), making `${ data.name }` available as simply `${ name }`
    // in a template... but let's make it opt-in for the moment at least. There
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
    const code = '\n' + indent
        + (options.nostrict ? 'with(data) ' : '"use strict";')
        + 'return this.compose`' + source + '`;\n';

    // Return cached fn
    if (compiled[code]) { return compiled[code]; }

    // The DEBUG logging version (removed in built files)
    if (window.DEBUG) {
        try {
            const t0 = window.performance.now();
            const fn = compileFn(scope, parameters, code);
            const t1 = window.performance.now();

            // Store totals on the compile function
            compile.duration += (t1 - t0);
            compile.count    += 1;

            // Log this compile
            log('compile', (t1 - t0).toPrecision(3) + 'ms – ' + message, undefined, undefined, 'yellow');

            return compiled[code] = fn;
        }
        catch(e) {
            // Append message to error message
            e.message += ' in ' + message;
            throw e;
        }
    }

    // The quick version
    return compiled[key] = compileFn(scope, parameters, code);
}

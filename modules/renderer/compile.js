
import compileFn  from '../../../fn/modules/compile.js';
import { log }    from '../log.js';
import { indent } from './constants.js';

/**
compile(source, scope, parameters, message, options)
Compiles a literal template string to a function.

(`options.sloppy = true` enables template rendering `with(data)`.)
**/

// Store render functions against their source
export const compiled = {};

// Last param, message, is for logging/throwing message
export default function compile(source, scope, parameters, message = '', options = {}) {
    // Hey hey, we are not in 'strict mode' inside compiled functions by default
    // so we CAN use with(), but let's make it opt-in for the moment at least.
    // It's handy for accessing template variables of `data`. A small caveat
    // though: accessing a not-defined property via `with` does not appear to be
    // reflected in the `data` proxy access records where the property is not
    // defined. This is bad, because that property won't be registered for
    // rerendering. Also, arrays and other objects have their entire prototype
    // chain exposed, so `map()`, `filter()` and stuff can be called on the
    // array, which is just weird, and probably bad. If we are going to use
    // sloppy mode it would probably be best to devise some way of enforcing the
    // base data object to be a prototypeless object of some sort. Just a thought.
    const code = '\n' +
        indent + (options.sloppy ? 'with(data) {' : '"use strict";' ) + '\n' +
        indent + 'return this.compose`' + source + '`;\n' +
        (options.sloppy ? indent + '}\n' : '');

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

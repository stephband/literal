
import compileFn  from '../../../fn/modules/compile.js';
import { indent } from './constants.js';
import { log }    from '../log.js';


/**
compile(source, scope, parameters, message)
Compiles a literal template string to a function.
**/

// Store render functions against their source
export const compiled = {};

// Last param, message, is for logging/throwing message
export default function compile(source, scope, parameters, message = '') {
    const code = '\n' + indent + 'return this.compose`' + source + '`;\n';

    // Return cached fn
    // Todo: factor in keys from scope and parameters to make this key truly
    // unique to all same instances of compiled function
    const key = code;
    if (compiled[key]) { return compiled[key]; }

    // The DEBUG logging version, removed in built files
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

            return compiled[key] = fn;
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

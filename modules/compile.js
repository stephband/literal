
import compileFn  from '../../fn/modules/compile.js';
import { indent } from './constants.js';
import { log }    from './log.js';


/**
compile(scope, params, source, id, info, element)
Compiles a literal template to a function.
**/

// Store render functions against their source
export const compiled = {};

// Last two params, info and element, are purely for debug messages
export default function compile(source, scope, params, consts, message = '') {
    const code = '\n'
        + (consts ? indent + 'const { ' + consts + ' } = data;\n' : '')
        + indent + 'return this.compose`' + source + '`;\n';

    // Return cached fn
    // Todo: factor in keys from scope to make this key truly unique to all
    // same instances of compiled function
    const key = code;
    if (compiled[key]) { return compiled[key]; }

    if (window.DEBUG) {
        try {
            const t0 = window.performance.now();
            compiled[key] = compileFn(scope, params, code);

            const t1 = window.performance.now();
            compile.duration += (t1 - t0);
            compile.count    += 1;
            log('compile', (t1 - t0).toPrecision(3) + 'ms – ' + message, undefined, undefined, '#DDB523');

            return compiled[key];
        }
        catch(e) {
            // Append debug message to error message
            e.message += ' ' + message;
            throw e;
        }
    }

    return compiled[key] = compileFn(scope, params, code);
}

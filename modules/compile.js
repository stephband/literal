
import compileFn from '../../fn/modules/compile.js';


/**
compile(scope, params, source, id, info, element)
Compiles a literal template to a function.
**/

const indent = '  ';

// Store render functions against their source
export const literals = {};

// Last two params, info and element, are purely for debug messages
export default function compile(source, scope, params, consts, message = '') {
    const code = '\n'
        + (consts ? indent + 'const { ' + consts + ' } = data;\n' : '')
        + indent + 'return this.compose`' + source + '`;\n';

    // Return literalsd fn
    // Todo: factor in keys from scope to make this key truly unique to all
    // same instances of compiled function
    const key = code;
    if (literals[key]) { return literals[key]; }

    if (window.DEBUG) {
        try {
            const t0 = window.performance.now();

            literals[key] = compileFn(scope, params,
                'try {' + code + '} catch(e) {' +
                // Append info to error message
                indent + 'e.message += " ' + message.replace(/"/g, '\\"') + '";' +
                indent + 'throw e;' +
                '}'
            );

            const t1 = window.performance.now();
            //analytics.totalCompileTime += (t1 - t0);

            return literals[key];
        }
        catch(e) {
            // Append info to error message
            e.message += ' ' + message;
            throw e;
        }
    }

    return literals[key] = compileFn(scope, params, code);
}

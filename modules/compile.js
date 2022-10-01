
import compileFn from '../../fn/modules/compile.js';


/**
compile(scope, params, source, id, info, element)
Compiles a literal template to a function.
**/

const indent = '  ';

// Store render functions against their source
export const cache = {};

// Last two params, info and element, are purely for debug messages
export default function compile(source, scope, params, consts, id, info, element) {
    if (typeof source !== 'string') {
        throw new Error('Template is not a string');
    }

    const key = id || source;

    // Return cached fn
    if (cache[key]) { return cache[key]; }

    const code = '\n'
        + (id ? indent + '// Template #' + id + '\n' : '')
        + (consts ? indent + 'const { ' + consts + ' } = data;\n' : '')
        + indent + 'return this.compose`' + source + '`;\n';

    if (window.DEBUG) {
        try {
            const text = source.trim();
            const name = text.length > 32 ?
                text.slice(0, 30).replace(/\s+/g, ' ').replace(/"/g, '\\"') + ' …' :
                text.replace(/\s+/g, ' ').replace(/"/g, '\\"') ;

            const t0 = window.performance.now();
            cache[key] = compileFn(scope, params,
                'try {' + code + '} catch(e) {' +
                // Append useful info to error message
                indent + 'e.message += " in template #" + this.template + (element && element.tagName ? ", <" + element.tagName.toLowerCase() + (this.name ? " " + this.name + "=\\"' + name + '\\">" : "> ' + name + '") : "");' +
                indent + 'throw e;' +
                '}'
            );

            const t1 = window.performance.now();
            //analytics.totalCompileTime += (t1 - t0);

            // timeEnd(name);
            return cache[key];
        }
        catch(e) {
            // Append useful info to error message
            if (info) {
                e.message += ' in template #' + info.template + (element && element.tagName ? ', <' + element.tagName.toLowerCase() + (info.name ? ' ' + info.name + '="' + source + '">' : '>') : '') ;
            }
            throw e;
        }
    }

    return cache[key] = compileFn(scope, params, code);
}

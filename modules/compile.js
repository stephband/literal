
import compileFn from '../../fn/modules/compile.js';

/**
compile(scope, params, source, id, info, element)
Compiles a literal template to a function.
**/

const indent = '  ';

// Store render functions against their source
export const cache = {};

// Last two params, info and element, are purely for debug messages
export default function compile(scope, params, source, id, info, element) {
    if (typeof source !== 'string') {
        throw new Error('Template is not a string');
    }

    const key = id || source;

    // Return cached fn
    if (cache[key]) { return cache[key]; }

    const code = '\n'
        + (id ? indent + '// Template #' + id + '\n' : '')
        + indent + 'return render`' + source + '`;\n';

    if (window.DEBUG) {
        try {
            return cache[key] = compileFn(scope, params, 
                'try {' + code + '} catch(e) {' +
                // Append useful info to error message
                indent + 'e.message += " in template #" + this.template + (this.element && this.element.tagName ? ", <" + this.element.tagName.toLowerCase() + (this.name ? " " + this.name + "=\\"...\\">" : ">") : "");' +
                indent + 'throw e;' +
                '}'
            );
        }
        catch(e) {
            // Append useful info to error message
            e.message += ' in template #' + info.template + (element && element.tagName ? ', <' + element.tagName.toLowerCase() + (info.name ? ' ' + info.name + '="' + source + '">' : '>') : '') ;
            throw e;
        }
    }

    return cache[key] = compileFn(scope, params, code);
}

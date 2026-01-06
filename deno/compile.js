

// TODO: Remove this, delegate to modules/compile.js


import compileAsyncFn from 'fn/compile-async.js';
import { dimgreendim, dim, red, yellow } from './log.js';


const hints = {
    'Unexpected':
        '• Non-template backticks must be escaped: \\`\n' +
        '• ${} accepts any valid JS expression\n'
};

function logError(source, template, e) {
    // Print source code to console
    console.log('');
    console.log(dim, template.slice(0, 1000) + (template.length > 1000 ? '\n\n...\n' : '\n'));
    console.log(red, e.constructor.name + ':', e.message, 'parsing', source);
    const key = e.message.slice(0, 10);
    if (hints[key]) { console.log(yellow, '\nHints\n' + hints[key]); }
    console.log('');
    console.log(e.stack);
    console.log('');
}


/**
compile(scope, params, consts, source, id, DEBUG)
Returns a function that renders a literal template, where `scope` is an object
of values placed in the function's scope, `params` is a string of parameter names,
`consts` is a string of const names for constants destructured from the first
argument, `source` is the template literal source, and `id` an identifier for the cache.
**/

const indent = '  ';

// Store render functions against their ids
const cache = {};

export default function compile(scope, params, consts, source, id, DEBUG) {
    if (typeof source !== 'string') {
        throw new Error('Template is not a string');
    }

    const key = id || source;

    // Return cached fn
    if (cache[key]) return cache[key];

    const code = '\n'
        + (id ? indent + '// Template #' + id + '\n' : '')
        + (consts ? indent + 'const { ' + consts + ' } = arguments[0];\n' : '')
        + indent + 'return render`' + source + '`;\n';

    if (DEBUG) {
        console.log(dimgreendim, 'Literal', 'compile', id);

        // scope, paramString, code [, context]
        try {
            return cache[key] = compileAsyncFn(scope, params, code);
        }
        catch(e) {
            // Append useful info to error message
            e.message += ' in template ' + id.replace(Deno.cwd() + '/', '');
            throw e;
        }
    }
    else {
        return cache[key] = compileAsyncFn(scope, params, code);
    }
}

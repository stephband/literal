
import compileAsync from '../../fn/modules/compile-async.js';
//import log          from './log.js';

const DEBUG  = window.DEBUG === true || window.DEBUG && window.DEBUG.includes('literal');

const illegals = [
    // Reserved by literal
    "render",

    // Globals
    'NaN', 'Infinity', 'undefined',

/*  These are now caught by our better error handling
    // ES reserved words
    'do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 
    'enum', 'eval', 'null', 'this', 'true', 'void', 'with', 'await', 'break', 
    'catch', 'class', 'const', 'false', 'super', 'throw', 'while', 'yield', 
    'delete', 'export', 'import', 'public', 'return', 'static', 'switch', 
    'typeof', 'default', 'extends', 'finally', 'package', 'private', 'continue', 
    'debugger', 'function', 'arguments', 'interface', 'protected', 'implements', 
    'instanceof'
*/
];

/*
function logCompile(source, scope, vars) {
    log('compile', source + ' { ' + vars + ' }');

    // Sanity check params for scope overrides
    vars.split(/\s*,\s*          REMOVE SPACE       /).forEach((name) => {
        if (illegals.includes(name)) {
            throw new SyntaxError('Reserved word ' + name + ' cannot be used as template variable');
        }

        if (scope[name]) {
            log('warning', 'template variable ' 
                + name
                + ' overrides scope ' + typeof scope[name] + ' '
                + (typeof scope[name] === 'function' ? name + '()' : name),
                'red'
            );
        }
    });
}
*/

/**
compile(scope, source, id, constsObjectName, debugInfo)
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

    if (DEBUG) {
        try {
            //logCompile(id ? id : key.trim().length > 45 ? '`' + key.trim().slice(0, 33).replace(/ *\n */g, ' ') + ' ... ' +  key.trim().slice(-8).replace(/ *\n */g, ' ') + '`' : '`' + key.trim().replace(/ *\n */g, ' ') + '`', scope, 'data' + (vars ? ', ' + vars : ''));

            // Allow passing nothing to a render function by defaulting data to an 
            // empty object. Compiled function cannot be given a name as it will 
            // appear in template scope. 
            // Todo: test does outer function's name 'anonymous', which appears to 
            // be automatic, appear in scope?
            const fn = compileAsync(scope, params, 
                // Wrap code in a try/catch and append useful info to error message
                'try {' + code + '} catch(e) {' +
                indent + 'e.message += " in template #" + this.template + (this.element && this.element.tagName ? ", <" + this.element.tagName.toLowerCase() + (this.name ? " " + this.name + "=\\"...\\">" : ">") : "");' +
                indent + 'throw e;' +
                '}'
            );

            return cache[key] = fn;
        }
        catch(e) {
            // Append useful info to error message
            e.message += ' in template #' + info.template + (element && element.tagName ? ', <' + element.tagName.toLowerCase() + (info.name ? ' ' + info.name + '="' + source + '">' : '>') : '') ;
            throw e;
        }
    }

    return cache[key] = compileAsync(scope, params, code);
}

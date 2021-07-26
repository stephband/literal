
import compileAsync from '../../fn/modules/compile-async.js';
import log          from './log.js';

const DEBUG  = window.DEBUG === true || window.DEBUG && window.DEBUG.includes('literal');

const assign = Object.assign;

const illegals = [
    // Reserved by literal
    "render",
    // Globals
    'NaN', 'Infinity', 'undefined',
    // ES reserved words
    'do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 
    'enum', 'eval', 'null', 'this', 'true', 'void', 'with', 'await', 'break', 
    'catch', 'class', 'const', 'false', 'super', 'throw', 'while', 'yield', 
    'delete', 'export', 'import', 'public', 'return', 'static', 'switch', 
    'typeof', 'default', 'extends', 'finally', 'package', 'private', 'continue', 
    'debugger', 'function', 'arguments', 'interface', 'protected', 'implements', 
    'instanceof'
];

const hints = {
    'Unexpected':
        '• Non-template backticks must be escaped: \\`\n' +
        '• ${} accepts any valid JS expression\n'
};

const indent = '  ';

function logCompile(source, scope, vars) {
    log('compile', source + ' { ' + vars + ' }');

    // Sanity check params for scope overrides
    vars.split(/\s*,\s*/).forEach((name) => {
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

function logError(source, template, e) {
    // Print source code to console
    console.log('');
    console.log(template.slice(0, 1000) + (template.length > 1000 ? '\n\n...\n' : '\n'));
    console.log(
        e.constructor.name + ':',
        e.message, 
        'parsing', 
        '"' + (source.length < 60 ? source : source.slice(0,16) + ' ... ' + source.slice(-8)) + '"'
    );
    const key = e.message.slice(0, 10);
    if (hints[key]) { console.log('\nHints\n' + hints[key]); }
    console.log('');
    //console.log(e.stack);
    console.log('');
}


/**
compile(scope, params, template)
Returns a function that renders a literal template.
**/

// Store render functions against their template strings
export const cache = {};

/*
function renderToString(strings) {
    let n = 0;
    let string = strings[n];
    while (strings[++n] !== undefined) {
        string += arguments[n];
        string += strings[n];
    }
    return string;
}
*/

function isValidConst(namevalue) {
    const name = namevalue[0];
    return /^\w/.test(name);
}

function sanitiseVars(vars) {
    const names = vars.split(/\s*[,\s]\s*/).filter(isValidConst).sort();
    return names.join(', ');
}

export default function compile(scope, varstring, string, id, consts = 'data', templateName) {
    if (typeof string !== 'string') {
        throw new Error('Template is not a string');
    }

    const key = id || string;

    // Return cached fn
    if (cache[key]) { return cache[key]; }

    // Render function must be contained in scope
    // Since compilation is synchronous we can assign to scope at compile time
    //scope.render = render;

    // Alphabetise and format
    const vars = varstring && sanitiseVars(varstring) ;
    //const context = new Context(render);
    const code = '\n'
        + (id ? indent + '// Render ' + id + '\n' : '')
        + (vars ? indent + 'const { ' + vars + ' } = ' + consts + ';\n' : '')
        + indent + 'return render`' + string + '`;\n';

    if (DEBUG) {
        try {
            logCompile(id ? id : key.trim().length > 45 ? '`' + key.trim().slice(0, 33).replace(/ *\n */g, ' ') + ' ... ' +  key.trim().slice(-8).replace(/ *\n */g, ' ') + '`' : '`' + key.trim().replace(/ *\n */g, ' ') + '`', scope, 'data' + (vars ? ', ' + vars : ''));

            // Allow passing nothing to a render function by defaulting data to an 
            // empty object. Compiled function cannot be given a name as it will 
            // appear in template scope. 
            // Todo: test does outer function's name 'anonymous', which appears to 
            // be automatic, appear in scope?
            const fn = compileAsync(scope, 'data = {}', 
                // Wrap code in a try/catch and append template info to error messages
                'try {' + code + '} catch(e) ' +
                '{e.message += " in template #" + this.template + ", element <" + this.element.tagName.toLowerCase() + ">" + (this.name ? ", attribute " + this.name : ""); throw e; }'
            );

            return cache[key] = function literal() {
                //log('render ', id ? id : key.trim().length > 45 ? '`' + key.trim().slice(0, 33).replace(/ *\n */g, ' ') + ' ... ' +  key.trim().slice(-8).replace(/ *\n */g, ' ') + '`' : '`' + key.trim().replace(/ *\n */g, ' ') + '`', 'orange');    
                // Where this is global, neuter it
                return fn.apply(this, arguments);
            };
        }
        catch(e) {
            logError(key, code, e);
            throw e;
        }
    }

    return cache[key] = compileAsync(scope, 'data = {}', code);
}

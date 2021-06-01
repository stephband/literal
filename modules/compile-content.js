
import TemplateRenderer from './renderer-template.js';
import compile from './compile.js';
import toText  from './to-text.js';

function stringify(value) {
    // If value is a template renderer or a DOM node or fragment pass it 
    // straight through
    return value instanceof TemplateRenderer ? value :
        value instanceof Node ? value :
        toText(value) ;
}

function renderContent(values) {
    const strings  = values[0];
    const contents = [];

    let n = -1;
    let string = '';

    while (strings[++n] !== undefined) {
        // Append string
        string += strings[n];

        // Stringify value
        const value = stringify(values[n + 1]);

        // If value is a string, append that too
        if (typeof value === 'string') {
            string += value;
        }

        // Otherwise push everything into values (ignoring empty strings) and 
        // reset string
        else {
            string && contents.push(string);
            contents.push(value);
            string = '';
        }
    }
    
    string && contents.push(string);
    return contents;
}

export default function compileContent(scope, varstring, string, consts) {
    // scope, varstring, string, id, consts = 'data', render
    return compile(scope, varstring, string, null, consts, renderContent);
}

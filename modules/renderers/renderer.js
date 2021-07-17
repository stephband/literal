
//import library from '../library.js';
//import compile from '../compile.js';
import toText  from '../to-text.js';

const assign = Object.assign;

const isPromise = (object) => (object && typeof object === 'object' && object.then);

const reduce = (values) => values.reduce((output, value) => (
    // Ignore undefined and empty strings
    value === '' || value === undefined ?
        output :
        output + value
));

function stringify(value, string, render) {
    return value && typeof value === 'object' ? (
        // If expression returns a promise
        value.then ?
            value.then((value) => (
                string === '' ?
                    value :
                    string + value
            )) :
        // If expression returns an array with promises
        value.find ?
            value.find(isPromise) ?
                // Resolve promises and join to string
                Promise
                .all(value)
                .then((strings) => (
                    string === '' ?
                        reduce(strings.map(render)) :
                        string + reduce(strings.map(render))
                )) :
            // Otherwise join to string immediately
            string === '' ? 
                reduce(value.map(render)) :
                string + reduce(value.map(render)) :
        // pass any other value to render
        string === '' ?
            render(value) :
            string + render(value)
    ) :
    string === '' ?
        render(value) :
        string + render(value) ;
}

export function renderString(values) {
    const strings = values[0];
    return reduce(strings.map((string, i) => (
        //console.log(typeof string, string),
        i <= values.length ?
            // Strings 0 to n - 1
            stringify(values[i + 1], string, toText) :
            // Final string
            string === '' ? undefined :
            string
    )));
}

export function toPromise() {
    return Promise.all(arguments);
}

/** 
Renderer()
Base class/mixin for providing renderers with the properties 
`{ node, context, path }` and a generic `.render()` method.
**/

let id = 0;

export default function Renderer(node, context, options) {
    this.node    = node;
    this.context = context;
    this.path    = options.path;
    this.id      = ++id;
    this.count   = 0;
    this.templateId = options.templateId;
    //this.literal = options.literal || compile(library, options.consts, options.source, null, 'arguments[1]', toPromise);
}

assign(Renderer.prototype, {
    render: function() {
        ++this.count;
        return this.literal.apply(this, arguments)
        .then(this.resolve)
        .then(this.update);
    },

    resolve: renderString
});

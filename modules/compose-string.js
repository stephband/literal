import toText from './to-text.js';

const isPromise = (object) => (object
    && typeof object === 'object'
    && object.then);

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

export default function composeString(values) {
    const strings = values[0];
    return reduce(strings.map((string, i) => (
        i <= values.length ?
            // Strings 0 to n - 1
            stringify(values[i + 1], string, toText) :
            // Final string
            string === '' ? undefined :
            string
    )));
}

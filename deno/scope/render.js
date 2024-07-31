
import renderString from '../../modules/renderer/to-text.js';

/**
render(array, param)
**/

const join = (strings) => strings.join('');
const isPromise = (object) => object && object.then;

function stringify(value, string) {
    return value && typeof value === 'object' ? (
        // If expression returns a promise
        value.then ? value.then((value) => string + value) :
        // If expression returns an array with promises
        value.join ? value.find(isPromise) ?
            // Resolve promises and join to string
            Promise.all(value).then((strings) => string + strings.map(renderString).join('')) :
            // Otherwise join to string immediately
            string + value.map(renderString).join('') :
        // pass any other value to renderString
        string + renderString(value)
    ) :
    string + renderString(value) ;
}

export default function render(strings) {
    return Promise.all(
        strings.map((string, i) => (i + 1 < arguments.length ?
            stringify(arguments[i + 1], string) :
            string
        ))
    )
    .then(join);
}




/**
paramify(object)
Turns an object with enumerable properties into a native URL search
parameters object, rejecting undefined properties and flattening out
array values.
**/

import nothing from '../../../fn/modules/nothing.js';

export default function paramify(object) {
    // If this is an object with properties that may be arrays, flatten it
    // out into entries
    const params = typeof object === 'object' && typeof object.length !== 'number' ?
        Object.entries(object).flatMap((entry) => (
            entry[1] === undefined ? nothing :
            entry[1] && typeof entry[1] === 'object' && entry[1].map ? entry[1].map((value) => [entry[0], value]) :
            [entry]
        )) :
        object ;

    //console.log('PARAMIFY', object, params);
    return new URLSearchParams(params);
}

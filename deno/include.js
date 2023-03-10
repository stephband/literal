
import id              from '../../fn/modules/id.js';
import noop            from '../../fn/modules/noop.js';
import overload        from '../../fn/modules/overload.js';
import toType          from '../../fn/modules/to-type.js';

import getExtension    from '../modules/get-extension.js';
import getAbsolute     from './get-absolute.js';
import compileTemplate from './compile-template.js';
import imports         from './imports.js';

import { red, yellow } from './log.js';


/**
include(filepath, data)
Includes a template from `filepath`, rendering it with properties of `data`
as in-scope variables.
**/

const resolveScope = overload(toType, {
    'string':    imports,
    'object':    id,
    'undefined': noop,
    'default': (object) => {
        throw new Error('include(url, object) cannot be called with object of type ' + toType(object));
    }
});


function renderInclude(source, file, request, data) {
    return Promise.all([
        resolveScope(data, source),
        compileTemplate(file)
    ])
    .then(([data, render]) => render(request, data));
}

export default function include(source, src, request, data) {
    // Get absolute file path
    const file = getAbsolute(source, src);

    /*
    console.log('Include      ' + src,
        '\n  source:    ' + source,
        '\n  file:      ' + file,
        '\n  extension: ' + getExtension(file),
        '\n  data:      ' + (typeof data === 'string' ? data : JSON.stringify(data)),
        '\n'
    );
    */

    return renderInclude(source, file, request, data)
    .catch((e) => {
        console.log(red + ' ' + yellow, e.constructor.name + ' in', source);
        console.log(red, e.message);
    });
}

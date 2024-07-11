
/**
include(src, data)

Includes a template identified by `src`, passing in an object to render in that
template as `data`. In production it is recommended that `src` is a fragment
identifier referring to the id of a template already in the DOM:

```js
${ include('#another-template', data) }
```

The `include` function is partially applicable, making it easy to use for
looping over an array to return an array of rendered templates:

```js
${ data.array.map(include('#list-item')) }
```
**/

import Data            from '../../../fn/modules/signal-data.js';
import LiteralTemplate from '../literal-template.js';
import getById         from '../dom/get-by-id.js';
import requestTemplate from '../request-template.js';
import requestData     from '../request-data.js';

function push(template, data, element, parameters, options) {
    const renderer = new LiteralTemplate(template, element, parameters, options);
    renderer.push(data);
    return renderer;
}

function pipe(template, data, element, parameters, options) {
    const renderer = new LiteralTemplate(template, element, parameters, options);
    data.each((data) => renderer.push(data));
    renderer.done(data);
    return renderer;
}

export default function include(src, data, element, parameters, options) {
    // Operate on target to be sure we are not registering gets in
    // parent renderer
    const object = Data.objectOf(data);

    // If template is in document, src is its id
    if (/^#/.test(src)) {
        const template = getById(src);
        const dataRequest = typeof object === 'string' ? requestData(object) :
            object && object.then ? object :
            null;

        // Support JSON or module URLs
        if (dataRequest) {
            return dataRequest.then((data) => push(template, data, element, parameters, options));
        }

        // Support a stream of data
        if (object && object.pipe) {
            return pipe(template, object, element, parameters, options);
        }

        // Support object or ... ?
        return push(template, object || {}, element, parameters, options);
    }

    // Template is external to document
    const templateRequest = requestTemplate(src);
    const dataRequest = typeof object === 'string' ? requestData(object) :
        object && object.then ? object :
        object ;

    if (object && object.pipe) {
        return templateRequest
        .then((template) =>
            pipe(template, data, element, parameters, options)
        );
    }

    return Promise
    .all([templateRequest, dataRequest])
    .then(([template, data]) => push(template, data, element, parameters));
}



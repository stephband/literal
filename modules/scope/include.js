
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

import Data            from '../../../fn/modules/data.js';
import getById         from '../dom/get-by-id.js';
import Literal         from '../template.js';
import requestTemplate from '../request-template.js';
import requestData     from '../request-data.js';

function pipe(template, data, element, consts) {
    const renderer = Literal.fromTemplate(template, element, consts, data);
    //const renderer = new Template(template, element, consts, options);
    data.each((data) => renderer.push(data));
    renderer.done(data);
    return renderer;
}

export default function include(src, data, element, consts) {
    // Operate on target to be sure we are not registering gets in
    // parent renderer's signal
    const object = Data.objectOf(data);

    // If template is in document, src is its id
    if (/^#/.test(src)) {
        const template = getById(src);
        const dataRequest = typeof object === 'string' ? requestData(object) :
            object && object.then ? object :
            null;

        // Support JSON or module URLs
        if (dataRequest) {
            return dataRequest.then((data) => Literal.fromTemplate(template, element, consts, data));
        }

        // Support a stream of data
        if (object && object.pipe) {
            return pipe(template, object, element, consts, options);
        }

        // Support object or ... ?
        return Literal.fromTemplate(template, element, consts, data);
    }

    // Template is external to document
    const templateRequest = requestTemplate(src);
    const dataRequest = typeof object === 'string' ? requestData(object) :
        object && object.then ? object :
        object ;

    if (object && object.pipe) {
        return templateRequest
        .then((template) =>
            pipe(template, data, element, consts, options)
        );
    }

    return Promise
    .all([templateRequest, dataRequest])
    .then(([template, data]) => Literal.fromTemplate(template, element, consts, data));
}



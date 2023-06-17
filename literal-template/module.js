/**
<template is="literal-template">

A `literal-template` may be placed anywhere in your HTML, and is designed to make
it easy to mix dynamic content into static content in just those locations where
needed.

A `literal-template` is replaced by its own rendered content.

```html
<template is="literal-template">
    <pre>${ 'hello' }</pre>
</template>
```

<template is="literal-template">
    <pre>${ 'hello' }</pre>
</template>

Where JS fails a `literal-template` is left inert and unrendered.

```html
<template is="literal-template">
    <pre>${ throws an error }</pre>
</template>
```

The template's `data` object may be set with the `data` attribute. A `data`
attribute that parses as a URL imports a JavaScript module or fetches JSON:

```html
<template is="literal-template" data="../data/clock.js">
    <pre>${ data.time.toFixed(0) + 's' }</pre>
</template>
```

<template is="literal-template" data="../../data/clock.js">
    <pre>${ data.time.toFixed(0) + 's' }</pre>
</template>

### Include other templates

The template scope contains Literal's template helper functions. Use the
`include(src, data)` function to include other templates as literal templates:

```html
<template id="todo-li">
    <li>${ data.text }</li>
</template>

<template is="literal-template">
    <h5>Todo list</h5>
    <ul>${ include('#todo-li', { text: 'Wake up' }) }</ul>
</template>
```

<template id="todo-li">
    <li>${ data.text }</li>
</template>

<template is="literal-template">
    <h5>Todo list</h5>
    <ul>${ include('#todo-li', { text: 'Wake up' }) }</ul>
</template>


The `include(src, data)` function is partially applicable, helpful for
mapping an array of data objects to template includes:

```html
<template is="literal-template" data="../data/todo.json">
    <h5>Todo list</h5>
    <ul>${ data.tasks.map(include('#todo-li')) }</ul>
</template>
```

<template is="literal-template" data="../../data/todo.json">
    <h5>Todo list</h5>
    <ul>${ data.tasks.map(include('#todo-li')) }</ul>
</template>
**/


import noop             from '../../fn/modules/noop.js';
import Stream           from '../../fn/modules/stream.js';
import element, { getInternals as Internals } from '../../dom/modules/element.js';
import properties, { addLoading, removeLoading } from '../modules/properties.js';
import requestData      from '../modules/request-data.js';
import TemplateRenderer from '../modules/renderer-template.js';
import print            from '../modules/library/print.js';

const assign  = Object.assign;
const rpath   = /^(\.+|https?:\/)?\//;
const robject = /^(\{|\[)/;


/* Lifecycle */

function parseData(value) {
        // Object or array
    return robject.test(value) ? JSON.parse(value) :
        // Number
        !Number.isNaN(Number(value)) ? Number(value) :
        // Boolean
        value === 'true' ? true :
        value === 'false' ? false :
        // String
        value ;
}

function resolveData(value) {
    return rpath.test(value) ?
        requestData(value) :
        parseData(value) ;
}

function requestDataFromValue(template, datas, value) {
    if (typeof value === 'string') {
        if (rpath.test(value)) {
            addLoading(template);

            requestData(value)
            .then((data) => datas.push(data))
            .catch((e)   => onerror(e, template))
            .finally(()  => removeLoading(template));
        }
        else {
            datas.push(JSON.parse(value));
        }
    }
    else {
        datas.push(value);
    }
}

function requestDataFromDataset(template, datas, dataset) {
    const keys   = Object.keys(dataset);
    const values = Object.values(dataset);

    addLoading(template);

    Promise
    .all(values.map(resolveData))
    .then((values) => datas.push(
        values.reduce((data, value, i) => (data[keys[i]] = value, data), {})
    ))
    .catch((e)   => onerror(e, template))
    .finally(()  => removeLoading(template));
}

const onerror = window.DEBUG ?
    (e, element) => element.replaceWith(print(e)) :
    noop ;

// tag, template, lifecycle, properties, log
export default element('<template is="literal-template">', {
    construct: function() {
        const internals = Internals(this);

        internals.datas    = Stream.of();
        internals.renderer = new TemplateRenderer(this, {
            root:    document.documentElement,
            body:    document.body,
            host:    this,
            shadow:  undefined,
            element: this.parentElement
        });
    },

    connect: function(shadow) {
        const internals = Internals(this);
        const { datas, renderer } = internals;

        let replaced = false;

        datas.each((data) => {
            renderer.push(data);
            if (!replaced) {
                this.replaceWith(renderer.content);
                replaced = true;
            }
        });

        // If data property was not set use data found in dataset
        if (!internals.hasData) {
            requestDataFromDataset(this, datas, this.dataset);
        }
    }
},

assign({
    /**
    data=""
    A path to a JSON file or JS module exporting data to be rendered.

    ```html
    <template is="literal-template" data="./data.json">...</template>
    <template is="literal-template" data="./module.js">...</template>
    ```

    Named exports are supported via the hash:

    ```html
    <template is="literal-template" data="./module.js#namedExport">...</template>
    ```

    Paths may be rewritten. This helps when JS modules are bundled into a single
    module for production.

    ```
    import { urls } from './literal.js';

    urls({
        './path/to/module.js': './path/to/production/bundle.js#namedExport'
    });
    ```

    The `data` attribute also accepts raw JSON:

    ```html
    <template is="literal-template" data='{"property": "value"}'>...</template>
    ```
    **/

    /**
    .data

    The `data` property may be set with a path to a JSON file or JS module, or a
    raw JSON string and behaves the same way as the `data` attribute. In
    addition it accepts a JS object or array.

    Getting the `data` property returns the data object currently being
    rendered. Note that if a path was set, this object is not available
    immediately, as the data must first be fetched.

    Technically, the returned data object is a _proxy_ of the object that has
    been set. Mutations to the data object are detected by the proxy and the
    DOM is rendered accordingly.
    **/

    data: {
        attribute: function(value) {
            this.data = value;
        },

        get: function() {
            const internals = Internals(this);
            return internals.renderer ?
                internals.renderer.data :
                null ;
        },

        set: function(value) {
            const internals = Internals(this);

            requestDataFromValue(this, internals.datas, value);
            // Flag data as having come from the data property
            internals.hasData = true;
        }
    }
}, properties));

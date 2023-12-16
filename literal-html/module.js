/**
<template is="literal-html">

A `literal-html` template may be placed anywhere in your HTML. It is designed to
make it easy to mix islands of dynamically rendered content into static content.

A `literal-html` template is replaced by its own rendered content.

```html
<template is="literal-html">
    <pre>${ 'hello' }</pre>
</template>
```

<template is="literal-html">
    <pre>${ 'hello' }</pre>
</template>

Where JS fails a `literal-html` template is left inert and unrendered.

```html
<template is="literal-html">
    <pre>${ throwSomeError() }</pre>
</template>
```

The template's `data` object may be set with the `src` attribute. A `src`
attribute imports a JavaScript module or fetches JSON.

```html
<template is="literal-html" src="../data/clock.js">
    <pre>${ data.time.toFixed(0) + 's' }</pre>
</template>
```

<template is="literal-html" src="../../data/clock.js">
    <pre>${ data.time.toFixed(0) + 's' }</pre>
</template>

That imports the default export of `clock.js`. Named exports may be imported
using an identifier, eg. `"../../data/clock.js#namedExport"`.

### Include other templates

The template scope contains a number of helper functions. The
`include(src, data)` function includes other templates:

```html
<template id="todo-li">
    <li>${ data.text }</li>
</template>

<template is="literal-html">
    <h5>Todo list</h5>
    <ul>${ include('#todo-li', { text: 'Wake up' }) }</ul>
</template>
```

<template id="todo-li">
    <li>${ data.text }</li>
</template>

<template is="literal-html">
    <h5>Todo list</h5>
    <ul>${ include('#todo-li', { text: 'Wake up' }) }</ul>
</template>


The `include(src, data)` function is partially applicable, which is helpful for
mapping an array of objects to template includes:

```html
<template is="literal-html" src="../data/todo.json">
    <h5>Todo list</h5>
    <ul>${ data.tasks.map(include('#todo-li')) }</ul>
</template>
```

<template is="literal-html" src="../../data/todo.json">
    <h5>Todo list</h5>
    <ul>${ data.tasks.map(include('#todo-li')) }</ul>
</template>
**/


import noop             from '../../fn/modules/noop.js';
import element, { getInternals as Internals } from '../../dom/modules/element.js';
import LatestStream     from '../modules/latest-stream.js';
import requestData      from '../modules/request-data.js';
import TemplateRenderer from '../modules/renderer-template.js';
import print            from '../modules/scope/print.js';

const assign  = Object.assign;
const rpath   = /^(\.+|https?:\/)?\//;
const robject = /^(\{|\[)/;

const onerror = window.DEBUG ?
    (e, element) => element.replaceWith(print(e)) :
    noop ;

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

function getDataFromDataset(datas, dataset) {
    const keys   = Object.keys(dataset);
    const values = Object.values(dataset);

    // Do this if you don't want templats to render before they are explicitly
    // assigned data
    //if (!keys.length) { return; }

    datas.push(values
        .map(parseData)
        .reduce((data, value, i) => (data[keys[i]] = value, data), {})
    );
}

// tag, template, lifecycle, properties, log
export default element('<template is="literal-html">', {
    construct: function() {
        const internals = Internals(this);
        internals.initialised = false;
        internals.pushed      = false;
        internals.datas       = new LatestStream();
        internals.renderer    = new TemplateRenderer(this, this.parentElement, {
            /*host:    this,
            shadow:  undefined*/
        });
    },

    connect: function(shadow) {
        const internals = Internals(this);

        // If already initialised do nothing
        if (internals.initialised) { return; }
        internals.initialised = true;

        const { datas, renderer } = internals;
        datas.each((object) => {
            renderer.push(object);

            // Replace DOM content on first push
            if (!internals.pushed) {
                internals.pushed = true;
                this.replaceWith(renderer.content);
            }
        });

        // If src or data was not set use data found in dataset
        if (!internals.promise && !internals.pushed) {
            getDataFromDataset(datas, this.dataset);
        }
    }
}, {
    /**
    src=""
    A path to a JSON file or JS module exporting data to be rendered.

    ```html
    <template is="literal-html" src="./data.json">...</template>
    <template is="literal-html" src="./module.js">...</template>
    ```

    Named exports are supported via an identifier:

    ```html
    <template is="literal-html" data="./module.js#namedExport">...</template>
    ```
    **/

    src: {
        attribute: function(url) {
            this.src = url;
        },

        get: function() {
            return Internals(this).src;
        },

        set: function(url) {
            const internals = Internals(this);
            internals.src = url;

            // Cancel existing promise of data
            if (internals.promise) {
                internals.promise.cancelled = true;
                internals.promise = undefined;
            }

            // Set internals.promise
            const p = internals.promise = requestData(url)
            .then((data) => {
                if (!p.cancelled) {
                    this.data = data;
                }
            })
            .catch((e) => onerror(e, this));
        }
    },


    /**
    data-*=""
    If there is no `src` or `data` attribute literal populates `data` object
    from the dataset properties. So `data-count="3"` may be used in the template
    with `${ data.count }`.

    (If the template _does_ have a `src` attribute, the dataset proper can still
    be accessed in (the usual way)[https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset],
    with `${ element.dataset.count }`.)
    **/

    /**
    .data

    The `data` property may be set with a JS object or array.

    Getting the `data` property returns the object currently being rendered.
    Sort of. The returned data object is actually a _proxy_ of the set object.
    This data proxy monitors mutations which the Literal template is already
    observing, so changes to this data are reflected in the DOM immediately
    (well, not quite immediately – literal renders changes on the next frame).
    **/

    data: {
        attribute: function(json) {
            try {
                this.data = JSON.parse(json);
            }
            catch(e) {
                throw new Error('Invalid JSON in <template is="literal-template"> data attribute: "' + json + '"');
            }
        },

        get: function() {
            const internals = Internals(this);
            return internals.renderer ?
                internals.renderer.data :
                null ;
        },

        set: function(object) {
            const internals = Internals(this);
            internals.datas.push(object || null);
        }
    }
});

/**
<template is="insert-template">

An `insert-template` is replaced by its own rendered content. Where JS fails
it is left inert and unrendered.

The constant `data` inside the template is an object. Where `insert-template`
has `data-` attributes `data` is populated with their parsed values. Values
parse as numbers, strings, booleans, JSON, or as URLs.

```html
<template is="insert-template" data-text="hello">
    <pre>${ data.text }</pre>
</template>
```

<pre>hello</pre>

A `data-` attribute that parses as a URL makes a request. The request imports
a JS module or fetches JSON:

```html
<template is="insert-template" data="../data/dom-clock.js">
    <pre>${ data.time.toFixed(0) }s</pre>
</template>
```

<template is="insert-template" data="../data/dom-clock.js">
    <pre>${ data.time.toFixed(0) }s</pre>
</template>

## Enhancing content

`<template is="insert-template">` is designed to make enhancing static content
with dynamic content easy. Let's consider a 'favourites' button. The server
gives us a link to the `/favourites/` page:

```html
<a href="/favourites/" class="fav-icon">
    Favourites
</a>
```

<a href="/favourites/" class="fav-icon">
    Favourites
</a>

We want to enhance that button with a badge that displays a count of our
favourites, a count that dynamically updates as we add and remove favourites:

```html
<a href="/favourites/" class="fav-icon">
    Favourites
    <template is="insert-template" data="../data/favourites.js">
        <span class="badge">${ data.count }</span>
    </template>
</a>
```

<a href="/favourites/" class="fav-icon">
    Favourites
    <template is="insert-template" data="../data/favourites.js">
        <span class="badge">${ data.count }</span>
    </template>
</a>

To see the count badge update we now need some things to favourite:

```html
<template is="insert-template" data="../data/favourites.js">
    <button type="button" class="${ data.ids.includes('a') ? 'fav' : 'not-fav' }">
        A
        ${ events('click', element).each((e) => data.toggle('a')) }
    </button>
</template>
```

<template is="insert-template" data="../data/favourites.js">
    <button type="button" class="${ data.ids.includes('a') ? 'fav' : 'not-fav' }">
        A
        ${ events('click', element).each((e) => data.toggle('a')) }
    </button>
</template>

**/


import noop             from '../../fn/modules/noop.js';
import Stream           from '../../fn/modules/stream.js';
import element, { getInternals as Internals } from '../../dom/modules/element.js';
import properties, { addLoading, removeLoading } from '../modules/properties.js';
import requestData      from '../modules/request-data.js';
import TemplateRenderer from '../modules/renderer-template.js';
import print            from '../modules/library/print.js';

const assign = Object.assign;
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

const onerror = window.DEBUG ?
    (e, element) => {
        element.replaceWith(print(e));
        throw e;
    } :
    noop ;


// tag, template, lifecycle, properties, log
export default element('<template is="insert-template">', {
    construct: function() {
        const internals = Internals(this);
        const datas     = internals.datas = Stream.of();
        const renderer  = internals.renderer = new TemplateRenderer(this, {
            root:    document.documentElement,
            body:    document.body,
            host:    this,
            shadow:  undefined,
            element: this.parentElement
        });

        // Resolve data from dataset attributes
        const keys   = Object.keys(this.dataset);
        const values = Object.values(this.dataset);
/*
        Promise
        .all(values.map(resolveData))
        .then((values) =>
            datas.push(values.reduce((data, value, i) => {
                data[keys[i]] = value;
                return data;
            }, {}))
        );
*/
    },

    connect: function(shadow) {
        const { datas, renderer } = Internals(this);
        let marker = this;

        datas.each((data) => {
console.log('DATA!!', data);
            renderer.push(data);
if (!this.replaced) {
console.log('REPLACE!!');
            marker.replaceWith(renderer.content);
            this.replaced = true;
}
        });
    },

    disconnect: function() {
        console.log('DISCONNECT!!');
    },

    load: function(shadow) {
        //console.log('LOAD');
    }
},
assign({
    /**
    data=""
    A path to a JSON file or JS module exporting data to be rendered.

    ```html
    <template-include src="#template" data="./data.json"></template-include>
    <template-include src="#template" data="./module.js"></template-include>
    ```

    Named exports are supported via the path hash:

    ```html
    <template-include src="#template" data="./module.js#namedExport"></template-include>
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
    <template-include src="#template" data='{"property": "value"}'></template-include>
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
            const internal = Internals(this);
            return internal.renderer ?
                internal.renderer.data :
                null ;
        },

        set: function(value) {
            const internals = Internals(this);

            if (typeof value === 'string') {
                if (rpath.test(value)) {
                    addLoading(this);

                    // Wait a tick before requesting data. On initial page load
                    // we have not yet had time to populate rewrite URLs because
                    // custom element setup runs synchronously. Give us a tick
                    // so we can do that.
                    Promise
                    .resolve(value)
                    .then(requestData)
                    .then((data) => internals.datas.push(data))
                    .catch((e)   => onerror(e, this))
                    .finally(()  => removeLoading(this));
                }
                else {
                    internals.datas.push(JSON.parse(value));
                }
            }
            else {
                internals.datas.push(value);
            }
        }
    }
}, properties));

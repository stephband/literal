/**
<template is="insert-template">

An `insert-template` is replaced by its own rendered content.

The constant `data` inside the template is an object populated with the parsed
values of the template's `data-` attributes.

```html
<template is="insert-template" data-text="hello">
    <pre>${ data.text }</pre>
</template>
```

<div class="example">
    <pre>hello</pre>
</div>

Values parse as numbers, strings, booleans, JSON, or as URLs. A `data-`
attribute that parses as a URL makes a request that imports a JS module or
fetches JSON:

```html
<template is="insert-template" data="../data/clock.js">
    <pre>${ data.time.toFixed(0) + 's' }</pre>
</template>
```

<div class="example">
    <template is="insert-template" data="../data/clock.js">
        <pre>${ data.time.toFixed(0) + 's' }</pre>
    </template>
</div>

The `insert-template` element is designed to make it easy to enhance static
content with dynamic content, as it can be placed anywhere in your HTML. Where
JS fails it is left inert and unrendered.

## Enhancing content

Let's consider a classic  'favourites' button. The static version is a link to
the `/favourites/` page represented by an icon:

```html
<a href="/favourites/" class="fav-icon">Favourites</a>
```

<div class="example">
    <a href="/favourites/" class="fav-icon">
        Favourites
    </a>
</div>

We want to enhance that link with a badge that displays a count of our
favourites, so we use an `insert-template` to render a `<span>` containing the
count inside the link:

```html
<a href="/favourites/" class="fav-icon">
    Favourites
    <template is="insert-template" data="../data/favourites.js">
        <span class="badge">${ data.count }</span>
    </template>
</a>
```

<div class="example">
    <a href="/favourites/" class="fav-icon">
        Favourites
        <template is="insert-template" data="../data/favourites.js">
            <span class="badge">${ data.count }</span>
        </template>
    </a>
</div>

This count comes from the module at `../data/favourites.js`. That module also
has a `toggle()` method that we may use to add or remove ids from a list of
favourites, enabling us to write a favourite button:

```html
<template is="insert-template" data="../data/favourites.js">
    <button type="button">
        ${ data.ids.includes('a') ? 'Remove from favourites' : 'Add to favourites' }
        ${ events('click', element).each((e) => data.toggle('a')) }
    </button>
</template>
```

<div class="example">
    <template is="insert-template" data="../data/favourites.js">
        <button type="button" class="${ data.ids.includes('a') ? 'fav' : 'not-fav' }">
            ${ data.ids.includes('a') ? 'Remove from favourites' : 'Add to favourites' }
            ${ events('click', element).each((e) => data.toggle('a')) }
        </button>
    </template>
</div>

Note how the badge in the favourites link is updated when this is clicked.

## Importing production modules

URLs to modules may be rewritten, which is useful if you are bundling modules
for production. Rather than having to rewrite the HTML with new data URLs,
Literal provides an `urls` map:

```js
import { urls } from '../module.js';

assign(urls, {
    // Map the default export of favourites.js to the export
    // named 'favourites' of bundle.js...
    '../data/favourites.js': '../build/bundle.js#favourites'
});

```

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

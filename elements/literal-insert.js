/**
<template is="literal-insert">

A `literal-insert` may be placed anywhere in your HTML, and is designed to
mix dynamic content into static content in the particular locations where it is
needed.

A `literal-insert` is replaced by its own rendered content.

```html
<template is="literal-insert">
    <pre>${ 'hello' }</pre>
</template>
```

<div class="example">
    <pre>hello</pre>
</div>

The template's `data` constant may be set by the `data` attribute, which may
contain JSON or a URL. A `data` attribute that parses as a URL makes a request
to import a JavaScript module or to fetch JSON:

```html
<template is="literal-insert" data="../data/clock.js">
    <pre>${ data.time.toFixed(0) + 's' }</pre>
</template>
```

<div class="example">
    <template is="literal-insert" data="../data/clock.js">
        <pre>${ data.time.toFixed(0) + 's' }</pre>
    </template>
</div>

The template has access to Literal's template constants and functions. Use the
`include()` function to include other templates:

```html
<!-- In the head -->
<template id="todo-li">
    <li>${ data.text }</li>
</template>

<!-- In the body -->
<h3>Todo list</h3>
<template is="literal-insert" data="../data/todo.json">
    <ul>${ data.tasks.map(include('todo-li')) }</ul>
</template>
```

<div class="example">
<template id="todo-li">
    <li>${ data.text }</li>
</template>

<h3>Todo list</h3>
<template is="literal-insert" data="../data/todo.json">
    <ul>${ data.tasks.map(include('#todo-li')) }</ul>
</template>
</div>

Where JS fails a `literal-insert` is left inert and unrendered.

```html
<template is="literal-insert" data="../data/clock.js">
    <pre>${ invalid JavaScript }</pre>
</template>
```

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
favourites, so we use an `literal-insert` to render a `<span>` containing the
count inside the link:

```html
<a href="/favourites/" class="fav-icon">
    Favourites
    <template is="literal-insert" data="../data/favourites.js">
        <span class="badge">${ data.count }</span>
    </template>
</a>
```

<div class="example">
    <a href="/favourites/" class="fav-icon">
        Favourites
        <template is="literal-insert" data="../data/favourites.js">
            <span class="badge">${ data.count }</span>
        </template>
    </a>
</div>

This count comes from the module at `../data/favourites.js`. That module also
has a `toggle()` method that we may use to add or remove ids from a list of
favourites, enabling us to write a favourite button:

```html
<template is="literal-insert" data="../data/favourites.js">
    <button type="button">
        ${ data.ids.includes('a') ? 'Remove from favourites' : 'Add to favourites' }
        ${ events('click', element).each((e) => data.toggle('a')) }
    </button>
</template>
```

<div class="example">
    <template is="literal-insert" data="../data/favourites.js">
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
export default element('<template is="literal-insert">', {
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
    <literal-include src="#template" data="./data.json"></literal-include>
    <literal-include src="#template" data="./module.js"></literal-include>
    ```

    Named exports are supported via the path hash:

    ```html
    <literal-include src="#template" data="./module.js#namedExport"></literal-include>
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
    <literal-include src="#template" data='{"property": "value"}'></literal-include>
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


/**
<include-literal>

A `include-literal` may be placed pretty much anywhere in your HTML, enabling
the insertion of chunks of dynamic, JS-rendered DOM wherever you like in a
document.

A `include-literal` finds a source template identified by its `src` attribute,
fetches JSON or imports a module referred to by its `data` attribute, renders
attributes and text found to contain literal tags, then replaces itself with
the rendered result.

A `include-literal` may contain fallback content, in case any of that fails.

```html
<template id="greetings">
    Hello ${ data.name }.
</template>

<include-literal src="#greetings" data="/users/1.json">
    Fallback content.
</include-literal>
```

Multiple `data-` attributes may be declared, their values become properties of
the `data` object inside the template:

```
<include-literal src="#add-to-collections-thumb" data-pk="34" ... ></include-literal>
```

Or a single `data` attribute can be used to pass JSON to use as the `data`
object inside the template:

```
<include-literal src="#add-to-collections-thumb" data='{"pk":34, ... }'></include-literal>
```

Both `data` and `data-` attributes also accept URLs. A URL is used to fetch a
.json file...

```
<include-literal src="#greetings" data="/users/1.json"></include-literal>
```

...or import the default export of a .js module:

```
<include-literal src="#greetings" data="/user-module.js"></include-literal>
```

**/

import element        from '../../dom/modules/element.js';
import { requestGet } from '../../dom/modules/request.js';
import create         from '../../dom/modules/create.js';
import request from '../library/request.js';
import TemplateRenderer from '../renderers/template-renderer.js';
import print   from '../library/print.js';

const rpath = /^\/|\.|^https?:\/\//;

function parseValue(string) {
    try {
        return JSON.parse(string);
    }
    catch(e) {
        return string;
    }
}

function resolveValue(value) {
    return rpath.test(value) ?
        request(value) :
        parseValue(value) ;
}

function zipObject(keys, values) {
    const object = {};
    let n = keys.length;
    while (n--) { object[keys[n]] = values[n]; }
    return object;
}

const onerror = window.DEBUG ? (e, element) => {
    element.loading = false;
    element.replaceWith(print(e));
    throw e;
} : (e, element) => {
    element.loading = false;
    if (element.frame) { cancelAnimationFrame(element.frame); }
    else { element.removeAttribute('loading'); }
    throw e;
} ;

element('<include-literal>', {
    construct: function() {
        if (window.DEBUG && !this.hasAttribute('src')) {
            console.error('<include-literal> a src attribute is required', this);
        }

        // Resolve data
        const keys   = Object.keys(this.dataset);
        const values = Object.values(this.dataset);
        const dataPromise = keys.length ?
            // where there are values in dataset compose data from dataset
            Promise
            .all(values.map(resolveValue))
            .then((values) => zipObject(keys, values)) :

            // Otherwise wait for data attribute
            new Promise((resolve, reject) => {
                this.resolveData = resolve;
                this.rejectData  = reject;
            }) ;

        this.promise = new Promise((resolve, reject) => {
            this.resolveSrc = resolve;
            this.rejectSrc = reject;
        })
        .then((src) => {
            // TODO: remove parent here, should not be needed until render
            this.renderer = new TemplateRenderer(src, this.parentElement);
            return dataPromise;
        })
        .catch((e) => onerror(e, this));
    },

    connect: function() {
        // If we are loading at connect time, add the loading attribute after a
        // couple of frames, allowing time for any styled transition to start
        (this.loading && (this.frame = requestAnimationFrame(() =>
            (this.loading && (this.frame = requestAnimationFrame(() =>
                (this.loading && this.setAttribute('loading', ''))
            )))
        )));

        // Cue up first render and replace
        this.promise.then((data) => {
            this.loading = false;
            this.renderer.element = this.parentElement;
            this.renderer.render(data);
            this.replaceWith(this.renderer.content);
            this.renderer.connect();
        });

        // Where no data or data-* attribute has been defined resolve with an
        // empty object...
        this.resolveData && this.resolveData({});
    }
}, {
    /**
    data=""
    Defines a JSON file or JS module containing data to be rendered. If a data
    attribute is not defined and empty object is used.

    To get data from a JSON file specify a path to JSON:

    ```html
    <include-literal src="#greetings" data="./package.json"></include-literal>
    ```

    Or import the default export of a JS module:

    ```html
    <include-literal src="#greetings" data="./modules/literal.js"></include-literal>
    ```

    Or import a named export of JS module:

    ```html
    <include-literal src="#greetings" data="./modules/literal.js#name"></include-literal>
    ```
    **/

    data: {
        attribute: function(value) {
            this.data = value;
        },

        get: function() {
            if (this.renderer) {
                return this.renderer.data;
            }
        },

        set: function(value) {
            if (this.renderer) {
                if (!value || value === 'null') {
                    this.renderer.push(null);
                }
                else if (typeof value === 'string') {
                    request(value).then((data) => this.renderer.push(data));
                }
                else {
                    this.renderer.push(value);
                }

                return;
            }

            if (!this.resolveData) {
                //console.log('BOO dont know why this is triggered multiple times', value)
                throw new Error('<include-literal> may possess either data-* attributes or a single data attribute, not both');
            }

            if (!value) {
                return;
            }
            else if (typeof value === 'string') {
                this.loading = true;
                this.request = request(value);
                this.resolveData(this.request);
            }
            else {
                this.resolveData(value);
            }
        }
    },

    loading: {
        /**
        loading=""
        Read-only (pseudo-read-only) boolean attribute indicating status of
        `src` and `data` requests.
        **/

        /**
        .loading
        Read-only (pseudo-read-only) boolean indicating status of `src` and
        `data` requests.
        **/
        value: false,
        writable: true
    },

    /**
    src=""
    Define a source template whose rendered content replaces this
    `include-literal`. This is a required attribute and must be in the form of
    a fragment identifier pointing to a `template` element in the DOM.
    **/

    src: {
        attribute: function(value) {
            if (!value) {
                return this.rejectSrc(new Error('<include-literal> source src="' + value + '" is empty'));
            }

            // This is for inserting static HTML for living archives, but the API
            // should be different for static HTML
            if (!/^#/.test(value)) {
                // Flag loading until we connect, at which point we add the
                // loading attribute that may be used to indicate loading. Why
                // wait? Because we are not in the DOM yet, and if we want a
                // loading icon to transition in the transition must begin after
                // we are already in the DOM.
                this.loading = true;

                requestGet(value).then((html) => {
                    return this.resolveSrc(create('fragment', html));
                });

                return;
            }

            const id = value.replace(/^#/, '');
            const template = document.getElementById(id);

            if (!template) {
                this.rejectSrc(new Error('<include-literal> src template "' + value + '" not found'));
                return;
            }

            this.resolveSrc(template);
        }
    }
});

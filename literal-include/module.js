/**
<literal-include>

A `literal-include` may be placed pretty much anywhere in your HTML, enabling
the insertion of chunks of dynamic, JS-rendered DOM wherever you like in a
document.

A `literal-include` finds a source template identified by its `src` attribute,
fetches JSON or imports a module referred to by its `data` attribute, renders
attributes and text found to contain literal tags, then replaces itself with
the rendered result.

A `literal-include` may contain fallback content, in case any of that fails.

```html
<template id="greetings">
    Hello ${ data.name }.
</template>

<literal-include src="#greetings" data="/users/1.json">
    Hello you!
</literal-include>
```

Multiple `data-` attributes may be declared, their values become properties of
the `data` object inside the template:

```html
<literal-include src="#add-to-collections-thumb" data-pk="34" ... ></literal-include>
```

Or a single `data` attribute can be used to pass JSON to use as the `data`
object inside the template:

```html
<literal-include src="#add-to-collections-thumb" data='{"pk":34, ... }'></literal-include>
```

Both `data` and `data-` attributes also accept URLs. A URL is used to fetch a
.json file...

```html
<literal-include src="#greetings" data="/users/1.json"></literal-include>
```

...or import the default export of a .js module:

```html
<literal-include src="#greetings" data="/user-module.js"></literal-include>
```

**/

import element, { getInternals as Internals } from '../../dom/modules/element.js';
import getById         from '../modules/dom/get-by-id.js';
import requestTemplate from '../modules/request-template.js';
import lifecycle       from './modules/lifecycle.js';

const assign = Object.assign;

export default element('literal-include', lifecycle, {
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
            const internal = Internals(this);
            return internal.renderer ?
                internal.renderer.data :
                null ;
        },

        set: function(value) {
            const internal = Internals(this);
            internal.datas.push(value);
        }
    },

    /**
    src=""
    Define a source template whose rendered content replaces this
    `<literal-include>`. This is a required attribute and must be in
    the form of a fragment identifier pointing to a `template` element
    in the DOM.
    **/

    src: {
        attribute: function(value) {
            const internal = Internals(this);

            if (/^#/.test(value)) {
                const template = getById(value);
                internal.templates.push(template);
                return;
            }

            // Flag loading until we connect, at which point we add the
            // loading attribute that may be used to indicate loading. Why
            // wait? Because we are not in the DOM yet, and if we want a
            // loading icon to transition in the transition must begin after
            // we are already in the DOM.
            /*
            addLoading(this);
            requestTemplate(value).then((template) => {
                internal.templates.push(template);
                removeLoading(this);
            });
            */
        }
    }
});

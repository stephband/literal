
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
    Fallback content.
</literal-include>
```

Multiple `data-` attributes may be declared, their values become properties of 
the `data` object inside the template:

```
<literal-include src="#add-to-collections-thumb" data-pk="34" ... ></literal-include>
```

Or a single `data` attribute can be used to pass JSON to use as the `data` 
object inside the template:

```
<literal-include src="#add-to-collections-thumb" data='{"pk":34, ... }'></literal-include>
```

Both `data` and `data-` attributes also accept URLs. A URL is used to fetch a 
.json file...

```
<literal-include src="#greetings" data="/users/1.json"></literal-include>
```

...or import the default export of a .js module:

```
<literal-include src="#greetings" data="/user-module.js"></literal-include>
```

**/

import element from '../../dom/modules/element.js';
import request from '../library/request.js';
import TemplateRenderer from '../modules/renderers/template-renderer.js';

const rpath = /^\.|^https?:\/\//;

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

element('<literal-include>', {
    construct: function() {
        if (!this.hasAttribute('src')) {
            console.error('<literal-include> a src attribute is required', this);
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

        // Resolve src template
        new Promise((resolve, reject) => {
            this.resolveSrc = resolve;
            this.rejectSrc = reject;
        })
        .then((template) => dataPromise.then((data) => {
            const renderer = new TemplateRenderer(template);

            // But once it has data we know we can render it, but we 
            // want to do that in the next batch
            renderer.cue(data).then(() => {
                this.before(renderer.content);
                this.remove();
            });
        }))
        .catch((message) => console.error(message, this));
    },

    connect: function() {
        // Where no data or data-* attribute has been defined resolve with an 
        // empty object
        this.resolveData && this.resolveData({});
    }
}, {
    /** 
    data=""

    Defines a JSON file or JS module containing data to be rendered. If a data 
    attribute is not defined and empty object is used.

    To get data from a JSON file specify a path to JSON:

    ```html
    <literal-include src="#greetings" data="./package.json"></literal-include>
    ```

    Or import the default export of a JS module:

    ```html
    <literal-include src="#greetings" data="./modules/literal.js"></literal-include>
    ```

    Or import a named export of JS module:

    ```html
    <literal-include src="#greetings" data="./modules/literal.js#name"></literal-include>
    ```
    **/

    data: {
        attribute: function(value) {
            if (!this.resolveData) {
                //console.log('BOO dont know why this is triggered multiple times', value)
                throw new Error('<literal-include> may possess either data-* attributes or a single data attribute, not both');
            }

            this.resolveData(request(value));
        }
    },

    /**
    src=""

    Define a source template whose rendered content replaces this
    `literal-include`. This is a required attribute and must be in the form of
    a fragment identifier pointing to a `template` element in the DOM.  
    **/

    src: {
        attribute: function(value) {
            if (!value) {
                return this.rejectSrc('<literal-include> source src="' + value + '" is empty');
            }

            const id = value.replace(/^#/, '');
            const template = document.getElementById(id);

            if (!template) {
                return this.rejectSrc('<literal-include> src template not found');
            }

            this.resolveSrc(template);
        }
    }
});

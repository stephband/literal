
/** 
<literal-include>

A `literal-include` may be placed pretty much anywhere in your HTML, enabling 
the insertion of chunks of dynamic, JS-rendered DOM wherever you like in a 
document. A `literal-include` may also contain fallback content.

A `literal-include` finds a source template identified by its `src` attribute
and replaces itself and its fallback content, with rendered content of the 
template. This works for standard templates:

```html
<template id="greetings">
    Rendered content.
</template>

<literal-include src="#greetings">
    Fallback content.
</literal-include>
```

And it works for `literal-template`s:

```html
<template is="literal-template" id="greetings">
    Hello ${ data.name }.
</template>

<literal-include src="#greetings" data="user.json">
    Hello user.
</literal-include>
```

**/

import element from '../../dom/modules/element.js';
import request from '../library/request.js';

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
        .then((template) => {
            // Template is a literal-template with a .Renderer() constructor
            if (template.Renderer) {
                // It requires data to be rendered
                return dataPromise.then((data) => {
                    const renderer = template.Renderer();

                    // But once it has data we know we can render it, but we 
                    // want to do that in the next batch
                    renderer.cue(data).then(() => {
                        this.before(renderer.content);
                        this.remove();
                    });
                });
            }

            // Template is a standard template with .content property
            this.after(template.content.cloneNode(true));
            this.remove();
        })
        .catch((message) => console.error(message, this));
    },

    connect: function() {
        // Where no data or data-* attribute has been defined resolve with an 
        // empty object
        this.resolveData && this.resolveData({});
    }
}, {
    /** 
    data="path/to/file.json"

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
    src="#id"

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

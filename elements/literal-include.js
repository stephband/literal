
/** 
<literal-include>

Include templates allow you to mix static and dynamic content, inserting
chunks of JS-rendered DOM where you like in a document.

An `<literal-include>` finds a source template identified by its `src` attribute
and replaces itself with the template content:

```html
<template id="greetings">
    Hello you.
</template>

<literal-include src="#greetings"></literal-include>
```

If the source template is a `<template is="literal-template">`, its `.render()` 
method is called with data resolved from data attributes on the `<literal-include>`.

```html
<template is="literal-template" id="greetings">
    Hello ${ data.name }.
</template>

<literal-include src="#greetings" data-name="Bartholemew"></literal-include>
```

To get data from an external JSON file specify a path to JSON:

```html
<literal-include src="#greetings" data="./package.json"></literal-include>
```

Or import the default export of a JS module:

```html
<literal-include src="#greetings" data="./modules/literal.js"></literal-include>
```

Or indeed the named export of JS module:

```html
<literal-include src="#greetings" data="./modules/literal.js#name"></literal-include>
```

Should the `literal-include` contain html, note that that content is 
displayed until templated content has been fetched and rendered, allowing you
to provide default or fallback content.
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
            // Template has a render method
            if (template.render) {
                // It requires data to be rendered
                return dataPromise.then((data) => {
                    this.after(template.render(data));
                    this.remove();
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
    Define a JSON file used to render templates (that have a `.render(data)` 
    method). If a data attribute is not defined and empty object is used.
    **/

    data: {
        attribute: function(value) {
            if (!this.resolveData) {
console.log('BOO dont know why this is triggered multiple times', value)
                throw new Error('<literal-include> may possess either data-* attributes or a single data attribute, not both');
            }

            this.resolveData(request(value));
        }
    },

    /** 
    src="#id"
    Define a source template whose rendered content replaces this
    `literal-include`. This is a required attribute.
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

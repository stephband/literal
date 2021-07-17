
/** 
<html-include>

Include templates allow you to mix static and dynamic content, inserting
chunks of JS-rendered DOM where you like in a document.

An `<html-include>` finds a source template identified by its `src` attribute
and replaces itself with the template content:

```html
<template id="greetings">
    Hello you.
</template>

<html-include src="#greetings"></html-include>
```

If the source template is a `<template is="literal-template">`, its `.render()` 
method is called with data resolved from data attributes on the `<html-include>`.

```html
<template is="literal-template" id="greetings">
    Hello ${ data.name }.
</template>

<html-include src="#greetings" data-name="Bartholemew"></html-include>
```

To get data from an external JSON file specify a path to JSON:

```html
<html-include src="#greetings" data="./package.json"></html-include>
```

Or import the default export of a JS module:

```html
<html-include src="#greetings" data="./modules/literal.js"></html-include>
```

Or indeed the named export of JS module:

```html
<html-include src="#greetings" data="./modules/literal.js#name"></html-include>
```

Should the `html-include` contain html, note that that content is 
displayed until templated content has been fetched and rendered, allowing you
to provide default or fallback content.
**/

import element from '../../dom/modules/element.js';
import requestData from '../modules/request-data.js';

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
        requestData(value) :
        parseValue(value) ;
}

function zipObject(keys, values) {
    const object = {};
    let n = keys.length;
    while (n--) { object[keys[n]] = values[n]; }
    return object;
}

element('<html-include>', {
    construct: function() {
        if (!this.hasAttribute('src')) {
            console.error('<html-include> a src attribute is required', this);
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
        // Where a data attribute has not been defined resolve with an 
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
                throw new Error('<html-include> may possess either data-* attributes or a single data attribute, not both');
            }

            this.resolveData(requestData(value));
        }
    },

    /** 
    src="#id"
    Define a source template whose rendered content replaces this
    `html-include`. This is a required attribute.
    **/

    src: {
        attribute: function(value) {
            if (!value) {
                return this.rejectSrc('<html-include> source src="' + value + '" is empty');
            }

            const id = value.replace(/^#/, '');
            const template = document.getElementById(id);

            if (!template) {
                return this.rejectSrc('<html-include> src template not found');
            }

            this.resolveSrc(template);
        }
    }
});


/** 
<include-template>

Include templates allow you to easily mix static and dynamic content, inserting
chunks of JS-rendered DOM wherever you like in your documnent.

An `<include-template>` finds a source template identified by its `src` attribute
and replaces itself with the template content:

```html
<template id="greetings">
    Hello you.
</template>

<include-template src="#greetings"></include-template>
```

If the source template has a `.render()` method (as is the case with the 
customised `<template is="literal-template">`), its `.render()` method is called 
with data read from `data-` attributes. The `<include-template>` is replaced 
with the result:

```html
<template is="literal-template" id="greetings">
    Hello ${ data.name }.
</template>

<include-template src="#greetings" data-name="Bartholemew"></include-template>
```

To import data from an external source such as a JSON file specify a `data` 
attribute with a path:

```html
<include-template src="#greetings" data="./package.json"></include-template>
```

Or import the default export of a JS module:

```html
<include-template src="#greetings" data="./modules/literal.js"></include-template>
```

Or indeed the named export of JS module:

```html
<include-template src="#greetings" data="./modules/literal.js#namedExport"></include-template>
```

Should the `include-template` contain static content, note that that content is 
displayed until templated content has been fetched and rendered, allowing you
to provide default or fallback content.
**/

import element  from '../../dom/modules/element.js';
import { requestGet as request } from '../../dom/modules/request.js';
import log      from '../modules/log.js';

const DEBUG = window.DEBUG === true || window.DEBUG && window.DEBUG.includes('literal');

const rejectSrc   = Promise.resolve('Cannot .render() missing src template');
const nullPromise = Promise.resolve(null);

element('include-template', {
    construct: function() {
        if (!this.hasAttribute('src')) {
            console.error('<include-template> missing required attribute src="uri"', this);
            return;
        }

        // Default to using this as template src
        this.template = null;
    },

    connect: function() {
        Promise
        .all([this.template, this.data])
        .then(([template, data]) => {
            //console.log(template, data);
            // Template element has a .render() method
            if (template.render) {
                this.after(template.render(data));
                this.remove();
            }
            // Template element is a built-in template with .content property
            else {
                this.after(template.content.cloneNode(true));
                this.remove();
            }
        })
        .catch((e) => console.error(e.message, this));
    },

    properties: {
        /** 
        data="path/to/file.json"
        Define a JSON file used to render templates (that have a `.render(data)` 
        method).
        **/
        
        data: {
            attribute: function(value) {
                this.data = !value ? nullPromise :
                    // Where data contains ${...}, compile and render value as literal
                    /^\$\{/.test(value) ? compileValue(value)() :
                    // Request JSON
                    request(value) ;
            }
        },

        /** 
        src="#id"
        Define a source template whose rendered content replaces this `include-template`. 
        **/

        src: {
            attribute: function(value) {
                if (!value) { return; }

                const id = value.replace(/^#/, '');
                const template = document.getElementById(id);

                if (!template) {
                    console.error('<include-template> source src="' + value + '" not found');
                }

                this.template = template;
            }
        }
    }
});

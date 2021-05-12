
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

var supportsCustomBuiltIn = false;

const rejectSrc   = Promise.resolve('Cannot .render() missing src template');
const nullPromise = Promise.resolve(null);

function reject() {
    return rejectSrc;
}

element('include-template', {
    construct: function() {
        // Default to using this as template src
        this.template = this;

        // Flag support
        supportsCustomBuiltIn = true;
    },

    properties: {
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
                    throw new Error('<include-template> src template "' + value + '" not found in document');
                }

                // Template element has a .render() method
                if (template.render) {
                    template
                    .render(this.data)
                    .then((nodes) => {
                        this.after(...nodes);
                        this.remove();
                    });
                }
                // Template element is a built-in template with .content property
                else {
                    this.after(template.content.cloneNode(true));
                    this.remove();
                }
            }
        },

        /** 
        data="path/to/file.json"
        Define a JSON file used to render templates (that have a `.render(data)` method).
        **/

        data: {
            attribute: function(value) {
                const promise = !value ? nullPromise :
                    // Where data contains ${...}, compile and render value as literal
                    /^\$\{/.test(value) ? compileValue(value)() :
                    // Request JSON
                    request(value) ;
    
                promise.then((data) => {
                    this.data = data;
                    this.update();
                });
            },

            get: function() {
                
            },

            set: function() {
                
            }
        }
    }
});


/*
// If one has not been found already, test for customised built-in element
// support by force creating a <template is="literal-template">
if (!supportsCustomBuiltIn) {
    document.createElement('include-template');
}

// If still not supported, fallback to a dom query for [is="literal-template"]
if (!supportsCustomBuiltIn) {
    log("Browser does not support custom built-in elements so we're doin' it oldskool selector stylee.");

    window.addEventListener('DOMContentLoaded', function() {
        window.document
        .querySelectorAll('include-template')
        .forEach((template) => {
            const fn  = template.getAttribute(config.attributeFn) || undefined;
            const src = template.getAttribute(config.attributeSrc) || undefined;
    
            if (fn) {
                Sparky(template, { fn: fn, src: src });
            }
            else {
                // If there is no attribute fn, there is no way for this sparky
                // to launch as it will never get scope. Enable sparky templates
                // with just an include by passing in blank scope.
                Sparky(template, { src: src }).push({});
            }
        });
    });
}
*/
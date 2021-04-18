

/** 
<render-template>

A `<render-template>` finds a source template identified by its `src` attribute
and replaces itself with the template content:

```html
<template id="greetings">
    Hello you.
</template>

<render-template src="#greetings"></render-template>
```

If the source template has a `.render()` method (as is the case with the 
customised template `is="literal-template"`), its `.render()` method is called 
with data read from `data-` attributes, and the `<render-template>` is replaced 
with the result:

```html
<template is="literal-template" id="greetings">
    Hello ${ data.name }.
</template>

<render-template src="#greetings" data-name="Bartholemew"></render-template>
```

To import from an external source such as a JSON file specify a `data` attribute 
with a path:

```html
<render-template src="#greetings" data="./package.json"></render-template>
```

The `data` attribute will also import the default export of a JS module:

```html
<render-template src="#greetings" data="./modules/literal.js"></render-template>
```

Or indeed the named export of JS module:

```html
<render-template src="#greetings" data="./modules/literal.js#namedExport"></render-template>
```
**/

import Literal  from '../module.js';
import element  from '../../dom/modules/element.js';
import { requestGet as request } from '../../dom/modules/request.js';
import log      from '../../bolt/literal/modules/log-browser.js';

var supportsCustomBuiltIn = false;

const rejectSrc   = Promise.resolve('Cannot .render() missing src template');
const nullPromise = Promise.resolve(null);

function reject() {
    return rejectSrc;
}

element('render-template', {
    construct: function() {
        // Default to using this as template src
        this.template = this;

        // Flag support
        supportsCustomBuiltIn = true;
    },

    properties: {
        src: {
            attribute: function(value) {
                if (value) {
                    const id = value.replace(/^#/, '');
                    this.template = document.getElementById(id);
                    if (this.template) {
                        this.render = Literal(this.template);
                        log('source ', '#' + id, 'yellow');
                        this.update();
                    }
                }
                else {
                    this.template = this;
                    this.render = /^\s*$/.test(this.innerHTML) ?
                        reject :
                        Literal(this.template) ;
                    this.update();
                }
            }
        },

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
            }
        }
    }
});

// If one has not been found already, test for customised built-in element
// support by force creating a <template is="literal-template">
if (!supportsCustomBuiltIn) {
    document.createElement('template', { is: 'literal-template' });
}

// If still not supported, fallback to a dom query for [is="literal-template"]
if (!supportsCustomBuiltIn) {
    log("Browser does not support custom built-in elements so we're doin' it oldskool selector stylee.");

    window.addEventListener('DOMContentLoaded', function() {
        window.document
        .querySelectorAll('render-template')
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

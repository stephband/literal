
/** 
<template is="literal-template">

Literal templates bind the DOM to data, parsing text content, classes and 
attributes as JS template literals. Here is a literal template that simply 
prints out `data` when rendered:

```html
<template is="literal-template" id="log">
    <pre>${ data }</pre>
</template>
```

Use a `<render-template>` to render this template into the document:

```html
<p>Here is package.json:</p>
<render-template src="#log" data="./package.json"></render-template>
```
**/


/* Register customised built-in element <template is="literal-template"> */

import element  from '../../dom/modules/element.js';
import Template from '../modules/template.js';
import log      from '../modules/log-browser.js';

var supportsCustomBuiltIn = false;

const rejectSrc   = Promise.resolve('Cannot .render() missing src template');

function reject() {
    return rejectSrc;
}

element('<template is=literal-template>', {
    construct: function() {        
        // Keep tabs on the number of renders
        this.renderCount = 0;

        // Flag support
        supportsCustomBuiltIn = true;

        this.getAttribute('inplace');
    },

    properties: {
        /** 
        .render(data)
        Returns a promise containing a document fragment of DOM rendered from
        the template contents.
        **/
        render: {
            value: function(data) {
                // Where template is just whitespace don't compile it as a template
                // Not sure why we bother?
                const promise = /^\s*$/.test(this.innerHTML) ?
                    reject :
                    Template(this) ;

                // Increment renderCount
                promise.then(() => ++this.renderCount) ;
                return promise;
            }
        }
    }
    
    /*
    update: {
        value: function update() {
            if (!this.data) { return; }

            const data    = this.data;
            const promise = this.render(data);

            // On first render add nodes to DOM
            if (!this.renderCount++) {
                promise.then((nodes) => {
                    this.after(...nodes);
                    this.remove();
                })
            }

            return this;
        }
    },
    */
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
        .querySelectorAll('[is="literal-template"]')
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

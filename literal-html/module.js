/**
<template is="literal-html">

A `literal-html` template may be placed anywhere in your HTML. It is designed to
make it easy to mix islands of dynamically rendered content into static content.

A `literal-html` template is replaced in the DOM with it's own rendered content.

Note that templates declared as shadow roots with the `shadowrootmode="open"` or
`shadowrootmode="closed"` attribute cannot also be `is="literal-html"` templates:
the HTML parser picks them up and treats them as shadows before the custom
element registry can upgrade them: they cannot be enhanced, sadly. However this
library provides another template, `<template is="literal-shadow">`
**/


import Signal         from 'fn/signal.js';
import element, { getInternals } from 'dom/element.js';
import assignDataset  from '../modules/dom/assign-dataset.js';
import requestData    from '../modules/request-data.js';
import DOMRenderer    from '../modules/template.js';
import { printError } from '../modules/print.js';


/* Lifecycle */

// tag, template, lifecycle, properties, log
export default element('<template is="literal-html">', {
    construct: function(shadow, internals) {
        internals.initialised = false;
        internals.pushed      = false;
        internals.data        = Signal.of();
        internals.renderer    = DOMRenderer.fromTemplate(this, this.parentElement);
    },

    connect: function(shadow, internals) {
        // If already initialised do nothing
        if (internals.initialised) { return; }
        internals.initialised = true;

        // Observe signal listens to signal value changes and calls fn()
        // immediately if signal already has value, and on next tick after
        // signal mutates
        Signal.observe(internals.data, (data) => {
            const { renderer } = internals;

            if (!data) return;
            const fragment = renderer.push(data);

            // Replace DOM content on first push
            if (internals.pushed) return;
            internals.pushed = true;
            this.replaceWith(fragment);
        });

        // If src or data was not set use data found in dataset
        if (!internals.promise && !internals.pushed) {
            internals.data.value = assignDataset({}, this.dataset);
        }
    }
}, {
    /**
    src=""
    A path to a JSON file or JS module exporting data to be rendered.

    ```html
    <template is="literal-html" src="./data.json">...</template>
    <template is="literal-html" src="./module.js">...</template>
    ```

    Named exports are supported via an identifier:

    ```html
    <template is="literal-html" data="./module.js#namedExport">...</template>
    ```
    **/

    src: {
        attribute: function(url) {
            this.src = url;
        },

        get: function() {
            return getInternals(this).src;
        },

        set: function(url) {
            const internals = getInternals(this);
            internals.src = url;

            // Cancel existing promise of data
            if (internals.promise) {
                internals.promise.cancelled = true;
                internals.promise = undefined;
            }

            // Set internals.promise
            const p = internals.promise = requestData(url)
            .then((data) => {
                if (p.cancelled) { return; }
                this.data = data;
            })
            .catch((error) => element.replaceWith(printError(this, error)));
        }
    },


    /**
    .data

    The `data` property may be set to an object.

    Getting the `data` property returns the object currently being rendered.
    Sort of. The returned data object is actually a _proxy_ of the set object.
    This data proxy monitors mutations which the Literal template is already
    observing, so changes to this data are reflected in the DOM immediately
    (well, not quite immediately – literal renders changes on the next frame).
    **/

    data: {
        attribute: function(json) {
            try {
                this.data = JSON.parse(json);
            }
            catch(e) {
                throw new Error('Invalid JSON in <template is="literal-template"> data attribute: "' + json + '"');
            }
        },

        get: function() {
            const internals = getInternals(this);
            return internals.renderer ?
                internals.renderer.data :
                null ;
        },

        set: function(object) {
            const internals = getInternals(this);
            internals.data.value = object || null;
        }
    }
}, null, 'stephen.band/literal/');

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


import Data           from 'fn/data.js';
import Signal         from 'fn/signal.js';
import element, { getInternals } from 'dom/element.js';
import { createObjectAttribute } from 'dom/element/create-attribute.js';
import assignDataset  from '../modules/dom/assign-dataset.js';
import requestData    from '../modules/request-data.js';
import Literal        from '../modules/template.js';
import { printError } from '../modules/print.js';


/* Lifecycle */

// tag, template, lifecycle, properties, log
export default element('<template is="literal-html">', {
    construct: function(shadow, internals) {
        internals.$data       = Signal.of();
        internals.initialised = false;
        internals.pushed      = false;
        internals.renderer    = Literal.fromTemplate(this, this.parentElement);
    },

    connect: function(shadow, internals) {
        const { $data, renderer } = internals;

        // If src or data was not set use data found in dataset
        if (!internals.initialised && !internals.promise && !internals.pushed) {
            internals.initialised = true;
            $data.value = assignDataset({}, this.dataset);
        }

        // Render data from signalling properties immediately once, and then
        // on next tick following a change signal
        return [Signal.observe($data, (data) => {
            if (!data) return;

            const fragment = renderer.push(data);

            // Replace DOM content on first push only
            if (internals.pushed) return;
            internals.pushed = true;
            this.replaceWith(fragment);
        })];
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
            this.data = JSON.parse(json);
        },

        get: function() {
            const internals = getInternals(this);
            return Data.of(internals.$data.value);
        },

        set: function(object) {
            const internals = getInternals(this);
            internals.$data.value = object ? Data.objectOf(object) : null;
        }
    }
}, null, 'stephen.band/literal/');

/**
<template is="literal-html">

A `literal-html` template may be placed anywhere in your HTML. It is designed to
make it easy to mix islands of dynamically rendered content into static content.
**/


import noop             from '../../fn/modules/noop.js';
import Signal           from '../../fn/modules/signal.js';
import element, { getInternals as Internals } from '../../dom/modules/element.js';
import assignDataset    from '../modules/dom/assign-dataset.js';
import requestData      from '../modules/request-data.js';
import DOMRenderer      from '../modules/template.js';
import { printError }   from '../modules/scope/print.js';

const assign  = Object.assign;
const rpath   = /^(\.+|https?:\/)?\//;
const robject = /^(\{|\[)/;

const onerror = window.DEBUG ?
    (e, element) => element.replaceWith(print(e)) :
    noop ;


/* Lifecycle */

// tag, template, lifecycle, properties, log
export default element('<template is="literal-html">', {
    construct: function() {
        const internals = Internals(this);
        internals.initialised = false;
        internals.pushed      = false;
        internals.data        = Signal.of();
        internals.renderer    = DOMRenderer.fromTemplate(this, this.parentElement);
    },

    connect: function(shadow) {
        const internals = Internals(this);

        // If already initialised do nothing
        if (internals.initialised) { return; }
        internals.initialised = true;

        // Observe signal listens to signal value changes and calls fn() on next
        // tick, as well as immediately if signal already has value
        Signal.observe(internals.data, () => {
            const { data, renderer } = internals;

            if (!data.value) return;
            const fragment = renderer.push(data.value);

            // Replace DOM content on first push
            if (!internals.pushed) {
                internals.pushed = true;
                this.replaceWith(fragment);
            }
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
            return Internals(this).src;
        },

        set: function(url) {
            const internals = Internals(this);
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
    data-*=""
    If there is no `src` or `data` attribute literal populates `data` object
    from the dataset properties. So `data-count="3"` may be used in the template
    with `${ data.count }`.

    (If the template _does_ have a `src` attribute, the dataset proper can still
    be accessed in (the usual way)[https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset],
    with `${ element.dataset.count }`.)
    **/

    /**
    .data

    The `data` property may be set with a JS object or array.

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
            const internals = Internals(this);
            return internals.renderer ?
                internals.renderer.data :
                null ;
        },

        set: function(object) {
            const internals = Internals(this);
            internals.data.value = object || null;
        }
    }
}, null, 'stephen.band/literal/');

/**
<template is="literal-shadow">

One `literal-shadow` template may be placed inside any element that supports
a declarative shadowRoot. The content of the template is renderered into the
shadow DOM of that element.

A `literal-shadow` template is designed to mimic the behaviour of a template
with a `shadowrootmode="open"` attribute, except the resulting shadow DOM is
populated with rendered content. Technically, though, the two are not the same,
and a little magic has to happen behind the scenes. (A `shadowrootmode` template
is processed by the HTML parser before the custom element registry can upgrade
it, so they are impossible to enhance with a renderer.)
**/

import Signal         from 'fn/signal.js';
import element        from 'dom/element.js';
import assignDataset  from '../modules/dom/assign-dataset.js';
import requestData    from '../modules/request-data.js';
import DOMRenderer    from '../modules/template.js';
import { printError } from '../modules/print.js';


/* Lifecycle */

// tag, template, lifecycle, properties, log
export default element('<template is="literal-shadow">', {
    construct: function(shadow, internals) {
        internals.pushed = false;
        internals.data   = Signal.of();
    },

    connect: function(shadow, internals) {
        // If already initialised do nothing
        if (internals.renderer) { return; }
        internals.renderer = DOMRenderer.fromTemplate(this, this.parentElement);

        // Observe signal listens to signal value changes and calls fn()
        // immediately if signal already value, then on next tick after signal
        // mutates
        Signal.observe(internals.data, (data) => {
            const { renderer } = internals;

            if (!data) return;
            const fragment = renderer.push(data);

            // Replace DOM content on first push
            if (internals.pushed) return;
            internals.pushed = true;
            // EXPERIMENTAL! This is problematic, as replacing
            // this.parentElement means `element` inside the template will
            // no longer refer to its real parent
            const parent = this.parentElement;
            // Remove this template
            this.remove();
            // Extract the parent's contents to a fragment
            const range = new Range();
            range.selectNodeContents(parent);
            const dom = range.extractContents();
            // The parent can only be given a shadow if it is re-parsed
            // with a declarative shadow root. We may as well use this
            // template to parse HTML, it's here and not doing anything.
            this.setHTMLUnsafe(parent.outerHTML.replace('></', '><template shadowrootmode="open"></template></'));
            const element = this.content.children[0];
            const shadow  = element.shadowRoot;
            // Give the recreated element the original's children
            element.append(dom);
            // Give the recreated element's shadow the renderer content
            shadow.append(fragment);
            // Replace parent in the DOM with it's freshly shadowed copy
            parent.replaceWith(element);
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
    <template is="literal-shadow" src="./data.json">...</template>
    <template is="literal-shadow" src="./module.js">...</template>
    ```

    Named exports are supported via an identifier:

    ```html
    <template is="literal-shadow" data="./module.js#namedExport">...</template>
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

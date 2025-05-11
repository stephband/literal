
import element, { getInternals } from 'dom/element.js';
import assignDataset  from '../modules/dom/assign-dataset.js';
import requestData    from '../modules/request-data.js';
import Template       from '../modules/template.js';
import { printError } from '../modules/print.js';
import Literal, { Data, Signal } from '../module.js';

/**
A `literal-html` template may be placed anywhere in your HTML. It is designed to
make it easy to mix islands of dynamically rendered content into static content.

A `literal-html` template is replaced in the DOM with it's own rendered content.

@element <template is="literal-html">

@attribute {string} src
A path to a `.js` module or JSON file of data to be rendered.

```html
<template is="literal-html" src="./data.js">...</template>
<template is="literal-html" src="./data.json">...</template>
```

@attribute {string} consts
A list of property names of `data` made accessible as constants inside a
template.

```html
<template is="literal-html" src="./data.js" const=""></template>
```

@attribute {string} data-*
Where a `src` attribute is not present the template's `data` object is read from
`data-*` attributes.

@property {string} src
A path to a `.js` module or JSON file of data to be rendered.

```html
<template is="literal-html" src="./data.js">...</template>
<template is="literal-html" src="./data.json">...</template>
```

@property {object} data
Data object rendered by the template. Getting the `data` property returns the
observable data proxy of the data object currently being rendered. Changes to
this data are rendered in the DOM on the next animation frame.
**/

// Note that templates declared as shadow roots with the `shadowrootmode="open"` or
// `shadowrootmode="closed"` attribute cannot also be `is="literal-html"` templates:
// the HTML parser picks them up and treats them as shadows before the custom
// element registry can upgrade them: they cannot be enhanced, sadly.

export default element('<template is="literal-html">', {
    construct: function(shadow, state) {
        state.template = Template.fromTemplate(this);
        // Debugging info for printError()
        if (window.DEBUG) state.code = `<template is="literal-html" id="${ this.id }">`;
    },

    connect: function(shadow, state) {
        const { renderer } = state;

        // If src or data was not set use data found in dataset
        if (!state.connected && !state.promise && !state.renderer) {
            state.connected = true;
            this.data = assignDataset({}, this.dataset);
        }
    }
}, {
    src: {
        attribute: function(url) {
            this.src = url;
        },

        get: function() {
            return getInternals(this).src;
        },

        set: function(url) {
            const state = getInternals(this);
            state.src = url;

            // Cancel existing promise of data
            if (state.promise) {
                state.promise.cancelled = true;
                state.promise = undefined;
            }

            // Set state.promise
            const p = requestData(url)
            .then((data) => { if (!p.cancelled) this.data = data; })
            .catch((error) => this.replaceWith(printError(state, error)));

            state.promise = p;
        }
    },

    data: {
        get: function() {
            const { renderer } = getInternals(this);
            return renderer && renderer.data;
        },

        set: function(object) {
            const state = getInternals(this);

            if (state.renderer) state.renderer.remove();
            if (!object) return;
            state.renderer = new Literal(
                state.template,
                object,
                { element: this.parentElement }
            );

            this.replaceWith(state.renderer.fragment);
        }
    }
}, 'stephen.band/literal/');


export { Literal, Data, Signal };

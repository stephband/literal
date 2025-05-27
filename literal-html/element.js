
import id             from 'fn/id.js';
import noop           from 'fn/noop.js';
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

let supportsCustomisedBuiltIn = false;


// We define custom element as a mixin so that it can be applied both to the
// real element constructor and, in Safari, where customised built-ins are not
// supported, detected template elements.

class Element extends id {
    #connected;
    #promise;
    #template;
    #renderer;
    #src;
    #debug;

    constructor(element) {
        // Flag support for customised bui;t-ins
        supportsCustomisedBuiltIn = true;
        // Instantiate <template>
        super(element);
        // Make a template object from this template element
        this.#template = Template.fromTemplate(this);
        // Debug info for printError()
        if (window.DEBUG) {
            this.#debug = { code: `<template is="literal-html" id="${ this.id }">` };
        }
    }

    get data() {
        return this.#renderer && this.#renderer.data;
    }

    set data(object) {
        const template = this.#template;

        if (this.#renderer) this.#renderer.remove();
        if (!object) return;

        this.#renderer = new Literal(template, object, { element: this.parentElement });
        this.replaceWith(this.#renderer.fragment);
    }

    get src() {
        return this.#src;
    }

    set src(url) {
        this.#src = url;

        // Cancel existing promise of data
        if (this.#promise) {
            this.#promise.cancelled = true;
            this.#promise = undefined;
        }

        // Set state.promise
        const p = requestData(url)
        .then((data) => { if (!p.cancelled) this.data = data; })
        .catch((error) => this.replaceWith(printError(this.#debug, error)));

        this.#promise = p;
    }

    connectedCallback() {
        const promise  = this.#promise;
        const renderer = this.#renderer;

        // If src or data was not set use data found in dataset
        if (!this.#connected && !promise && !renderer) {
            this.#connected = true;
            this.data = assignDataset({}, this.dataset);
        }
    }

    attributeChangedCallback(name, old, url) {
        if (name === 'src') this.src = url;
    }

    static observedAttributes = ['src'];
}


// Get properties from Element mixin prototype
const properties = Object.getOwnPropertyDescriptors(Element.prototype);
delete properties.constructor;


// Export the element
export default class LiteralTemplateElement extends HTMLTemplateElement {
    constructor() {
        super();
        new Element(this);
    }

    static observedAttributes = Element.observedAttributes;
}

Object.defineProperties(LiteralTemplateElement.prototype, properties);


// Register the element
if (window.DEBUG) console.log('%c<template is="literal-html">%c registered', 'color:#3a8ab0;font-weight:600;', 'color:#888888;font-weight:400;');
window.customElements.define('literal-html', LiteralTemplateElement, { extends: 'template' });


// Safari support

if (!supportsCustomisedBuiltIn) {
    // It may be there were none in the DOM when the customised element was
    // defined, in which case we must run a test.
    const div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.left = '-1000px';
    div.style.top  = '-1000px';
    div.innerHTML = '<template is="literal-html"></template>';
    document.body.append(div);
    div.remove();
}

if (!supportsCustomisedBuiltIn) {
    // it would appear there really is no support for customised built-ins.
    console.warn('Browser does not support customised built-in elements, polyfilling <template is="literal-html">');

    function upgradeElement(element) {
        const names = ['src', 'data'];
        const store = {};

        // Store values of property we are about to define
        names.forEach((key, i) => {
            if (element[key] !== undefined) store[key] = element[key];
        });

        // Define properties
        Object.defineProperties(element, properties);

        // Run constructor
        new Element(element);

        // Set properties
        Object.assign(element, store);

        // Detect and run src attribute
        const src = element.getAttribute('src');
        if (src) element.attributeChangedCallback('src', null, src);

        // Run connected callback
        element.connectedCallback();
    }

    function isNotUpgraded(element) {
        return !element.connectedCallback;
    }

    function upgrade(root) {
        Array
        .from(root.querySelectorAll('[is="literal-html"]'))
        .filter(isNotUpgraded)
        .forEach(upgradeElement);
    }

    function polyfillByRoot(root) {
        upgrade(root);
        const observer = new MutationObserver((records) => records
            .flatMap((record) => record.addedNodes)
            .filter((node) => node.nodeType === 1)
            .forEach((element) => element.matches('[is="literal-html"]') ?
                upgradeElement(element) :
                upgrade(element)
            )
        );
        observer.observe(root, { childList: true, subtree: true });
    }

    // Expose on element for use in shadow DOMs
    Element.polyfillByRoot = polyfillByRoot;

    // Run on document automatically
    polyfillByRoot(document);
}
else {
    Element.polyfillByRoot = noop;
}




export { Literal, Data, Signal };

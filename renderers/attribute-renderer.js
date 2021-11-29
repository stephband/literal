
import library   from '../modules/library.js';
import compile   from '../modules/compile.js';
import Renderer, { renderString } from './renderer.js';
import names     from './property-names.js';
import analytics from './analytics.js';

const assign = Object.assign;

/**
AttributeRenderer()
Constructs an object responsible for rendering to a plain text attribute.
**/

function setAttribute(node, name, value) {
    const prop = names[name] || name;

    // Seek and set a matching property
    if (prop in node) {
        if (node[prop] !== value) {
            node[prop] = value;
            return 1;
        }
    }

    // If that doesn't work set the attribute
    if (value === node.getAttribute(name)) {
        return 0;
    }

    node.setAttribute(name, value);
    return 1;
}

export default function AttributeRenderer(node, options) {
    Renderer.apply(this, arguments);

    this.name      = options.name;
    this.literally = options.literally || compile(library, 'data, element', options.source, null, options, this.element);

    // Analytics
    const id = '#' + options.template;
    ++analytics[id].attribute || (analytics[id].attribute = 1);
    ++analytics.Totals.attribute;
}

assign(AttributeRenderer.prototype, Renderer.prototype, {
    compose: function() {
        const value = renderString(arguments);
        return setAttribute(this.node, this.name, value);
    }
});

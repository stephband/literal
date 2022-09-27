
import library   from '../modules/library.js';
import compile   from '../modules/compile.js';
import Renderer, { renderString } from './renderer.js';
import names     from './property-names.js';

const assign = Object.assign;

/**
AttributeRenderer()
Constructs an object responsible for rendering to a plain text attribute.
**/

function setAttribute(node, name, value) {
    const prop = name in names ?
        names[name] :
        name;

    // Seek and set a matching property
    if (prop && prop in node) {
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

export default function AttributeRenderer(source, render, node, name, element, options) {
    this.element = element || node;
    this.node    = node;
    this.name    = name;
    this.render  = render || compile(library, 'data, element', source, null, options, this.element);

    Renderer.call(this, source, this.render);
}

assign(AttributeRenderer.prototype, Renderer.prototype, {
    compose: function() {
        const value = renderString(arguments);
        this.mutations = setAttribute(this.node, this.name, value);
        return this;
    }
});

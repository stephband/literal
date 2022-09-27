
import library   from '../modules/library.js';
import Renderer, { renderString } from './renderer.js';
import compile   from '../modules/compile.js';
import names     from './property-names.js';

const assign = Object.assign;
/**
BooleanRenderer()
Constructs an object responsible for rendering to a boolean attribute.
**/

export function setBooleanProperty(node, name, value) {
    const prop = names[name] || name;

    if (prop in node) {
        if ((!!value) === node[prop]) {
            return 0;
        }

        node[prop] = !!value;
    }
    else if (value) {
        node.setAttribute(name, name);
    }
    else {
        node.removeAttribute(name);
    }

    // Return DOM mutation count
    return 1;
}

export default function BooleanRenderer(source, render, node, name, element, options) {
    this.element = element || node;
    this.node    = node;
    this.name    = name;
    this.render  = render || compile(library, 'data, element', source, null, options, this.element);

    Renderer.call(this, source, this.render);

    // Remove the boolean until it is processed
    node.removeAttribute(name);
}

assign(BooleanRenderer.prototype, Renderer.prototype, {
    compose: function() {
        const value = renderString(arguments);
        this.mutations = setBooleanProperty(this.node, this.name, value);
        return this;
    }
});

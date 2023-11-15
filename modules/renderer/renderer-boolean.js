
import library        from '../library-dom.js';
import composeBoolean from './compose-boolean.js';
import names          from './property-names.js';
import Renderer       from './renderer.js';

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

export default function BooleanRenderer(source, node, path, name, parameters, message) {
    Renderer.call(this, source, library, assign({}, parameters, { element: node }), message);
    this.node     = node;
    this.path     = path;
    this.name     = name;

    // Remove the boolean until it is processed
    node.removeAttribute(name);
}

assign(BooleanRenderer.prototype, Renderer.prototype, {
    render: function(strings) {
        const value = composeBoolean(arguments);
        this.mutations = setBooleanProperty(this.node, this.name, value);
        return this;
    }
});
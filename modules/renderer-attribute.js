
import library       from './library.js';
import compile       from './compile.js';
import Renderer      from './renderer.js';
import composeString from './compose-string.js';
import names         from './property-names.js';

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

export default function AttributeRenderer(source, node, name) {
    this.element = node;
    this.node    = node;
    this.name    = name;

    const render = typeof source === 'string' ?
        compile(library, 'data, element', source, null, {}, node) :
        source ;

    Renderer.call(this, render);
}

assign(AttributeRenderer.prototype, Renderer.prototype, {
    compose: function() {
        const value = composeString(arguments);
        this.mutations = setAttribute(this.node, this.name, value);
        return this;
    }
});

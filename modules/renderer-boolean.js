
import library        from './library.js';
import Renderer       from './renderer.js';
import compile        from './compile.js';
import composeBoolean from './compose-boolean.js';
import names          from './property-names.js';

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

export default function BooleanRenderer(source, consts, path, node, name) {
    const render = typeof source === 'string' ?
        compile(source, library, 'data, element', consts, null, {}, node) :
        source ;

    Renderer.call(this, render);

    this.path    = path;
    this.element = node;
    this.node    = node;
    this.name    = name;

    // Remove the boolean until it is processed
    node.removeAttribute(name);
}

assign(BooleanRenderer.prototype, Renderer.prototype, {
    compose: function(strings) {
        const value = composeBoolean(arguments);
        this.mutations = setBooleanProperty(this.node, this.name, value);
        return this;
    }
});

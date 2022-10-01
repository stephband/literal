
import library        from './library.js';
import Renderer       from './renderer.js';
import composeBoolean from './compose-boolean.js';
import names          from './property-names.js';
import toDebugString  from './to-debug-string.js';

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

export default function BooleanRenderer(source, consts, path, node, name, template) {
    Renderer.call(this, source, library, { element: node }, consts, window.DEBUG && typeof source === 'string' && toDebugString(source, node, template));

    //this.template = template;
    this.path     = path;
    this.node     = node;
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

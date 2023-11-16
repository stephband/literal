
import library           from '../library-dom.js';
import composeBoolean    from './compose-boolean.js';
import names             from './property-names.js';
import AttributeRenderer from './renderer-attribute.js';

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

export default function BooleanRenderer(source, attribute, path, parameters, message) {
    AttributeRenderer.apply(this, arguments);
    this.node.removeAttribute(this.name);
}

assign(BooleanRenderer.prototype, AttributeRenderer.prototype, {
    render: function(strings) {
        const value = composeBoolean(arguments);
        this.mutations = setBooleanProperty(this.node, this.name, value);
        return this;
    }
});

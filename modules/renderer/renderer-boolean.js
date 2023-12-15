
import composeBoolean    from './compose-boolean.js';
import names             from './property-names.js';
import AttributeRenderer from './renderer-attribute.js';

const assign = Object.assign;


/**
BooleanRenderer()
Constructs an object responsible for rendering to a boolean attribute.
**/

export function setBooleanProperty(node, name, prop, writable, value) {
    if (writable) {
        if (node[prop] !== !!value) {
            node[prop] = !!value;
            return 1;
        }

        return 0;
    }

    if (value) {
        node.setAttribute(name, name);
    }
    else {
        node.removeAttribute(name);
    }

    return 1;
}

export default function BooleanRenderer(source, element, name, path, parameters, message) {
    AttributeRenderer.apply(this, arguments);
    this.element.removeAttribute(name);
}

assign(BooleanRenderer.prototype, AttributeRenderer.prototype, {
    render: function(strings) {
        const value = composeBoolean(arguments);
        this.mutations = setBooleanProperty(this.element, this.name, this.prop, this.writable, value);
        return this;
    }
});


import composeBoolean    from './compose-boolean.js';
import names             from './property-names.js';
import AttributeRenderer from './renderer-attribute.js';

const assign = Object.assign;


/**
BooleanRenderer()
Constructs an object responsible for rendering to a boolean attribute.
**/

export function setBooleanProperty(node, name, property, writable, value) {
    if (writable) {
        if (node[property] !== !!value) {
            node[property] = !!value;
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


export default class BooleanRenderer extends AttributeRenderer {
    static parameterNames = AttributeRenderer.parameterNames;

    render(strings) {
        const value = composeBoolean(arguments);
        this.mutations = setBooleanProperty(this.element, this.name, this.property, this.writable, value);
        return this;
    }
}

import composeBoolean    from './compose-boolean.js';
import AttributeRenderer from './renderer-attribute.js';
import { stats }         from './renderer.js';


/**
BooleanRenderer(fn, element, name, parameters)
Constructs an object responsible for rendering to a boolean attribute.
**/

function setBooleanProperty(node, name, value) {
    if (node[name] === !!value) return 0;
    node[name] = !!value;
    return 1;
}

function setBooleanAttribute(node, name, value) {
    // If attribute is already set...
    if ((node.getAttribute(name) !== null)) {
        if (value) return 0;
        node.removeAttribute(name);
        return 1;
    }

    // Otherwise...
    if (!value) return 0;
    node.setAttribute(name, name);
    return 1;
}

export default class BooleanRenderer extends AttributeRenderer {
    static parameterNames = AttributeRenderer.parameterNames;

    render(strings) {
        const value = composeBoolean(arguments);

        if (this.writable) {
            stats.property += setBooleanProperty(this.element, this.property, value);
        }
        else {
            stats.attribute += setBooleanAttribute(this.element, this.name, value) ;
        }

        return;
    }
}

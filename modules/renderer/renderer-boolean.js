
import Signal            from '../../../fn/modules/signal.js';
import composeBoolean    from './compose-boolean.js';
import AttributeRenderer from './renderer-attribute.js';
import { stats }         from './renderer.js';


/**
BooleanRenderer(signal, literal, parameters, element, name)
Constructs an object responsible for rendering to a boolean property or
attribute.
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

    /* Only needed to evaluate */
    constructor(signal, literal, parameters, element, name, debug) {
        super(signal, literal, parameters, element, name, debug);

        // A synchronous evaluation while data signal value is undefined binds
        // this renderer to changes to that signal. If signal value is an `data`
        // object it renders the renderer immediately.
        Signal.evaluate(this, this.evaluate);
    }

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

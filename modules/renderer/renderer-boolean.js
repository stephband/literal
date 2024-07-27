
import Signal            from '../../../fn/modules/signal.js';
import sum               from '../../../fn/modules/sum.js';
import AttributeRenderer from './renderer-attribute.js';
import { stats }         from './renderer.js';


/**
BooleanRenderer(signal, literal, consts, element, name)
Constructs an object responsible for rendering to a boolean property or
attribute.
**/

function setBooleanProperty(node, name, value) {
    if (node[name] === !!value) return;
    node[name] = !!value;
    if (window.DEUBG) ++stats.property;
}

function setBooleanAttribute(node, name, value) {
    // If attribute is already set...
    if ((node.getAttribute(name) !== null)) {
        if (value) return;
        node.removeAttribute(name);
        if (window.DEUBG) ++stats.attribute;
        return;
    }

    // Otherwise...
    if (!value) return;
    node.setAttribute(name, name);
    return;
}

export function toAttributeBoolean(values) {
    // Sum all values
    const strings = values[0];
    let n = 0;

    // Anything other than white space in strings counts as true
    if (/\S/.test(strings[n])) return true;
    while (strings[++n] !== undefined) {
        if (Boolean(values[n])) return true;
        if (/\S/.test(strings[n])) return true;
    }

    return false;
}


export default class BooleanRenderer extends AttributeRenderer {
    static consts = AttributeRenderer.consts;

    /* Only needed to evaluate */
    constructor(signal, literal, consts, element, name, debug) {
        super(signal, literal, consts, element, name, debug);

        // A synchronous evaluation while data signal value is undefined binds
        // this renderer to changes to that signal. If signal value is an `data`
        // object it renders the renderer immediately.
        Signal.evaluate(this, this.evaluate);
    }

    render(strings) {
        // If arguments contains a single expression use its value
        const value = this.singleExpression ?
            arguments[1] :
            toAttributeBoolean(arguments);

        return this.property ?
            setBooleanProperty(this.element, this.property, value) :
            setBooleanAttribute(this.element, this.name, value) ;
    }
}

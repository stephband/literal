
import Signal            from 'fn/signal.js';
import toCamelCase       from 'fn/to-camel-case.js';
import AttributeRenderer, { toAttributeString } from './renderer-attribute.js';
import toText            from './to-text.js';


/**
DatasetRenderer(signal, literal, consts, element, name)
Constructs an object responsible for rendering to the `.dataset` property.
**/

export default class DatasetRenderer extends AttributeRenderer {
    constructor(fn, parameters, element, name, compiled) {
        super(fn, parameters, element, name, compiled, false);

        // data-prop-thing to propThing
        this.property = toCamelCase(name.replace(/^data-/, ''));

        // A synchronous evaluation while data signal value is undefined binds
        // this renderer to changes to that signal, but if signal value is an
        // object it renders immediately.
        Signal.evaluate(this, this.evaluate);
    }

    renderSingle(value) {
        // Convert with toText so null/undefined/NaN/Signal stringify consistently
        return this.element.dataset[this.property] = toText(value);
    }

    render() {
        return this.element.dataset[this.property] = toAttributeString(arguments);
    }
}


import Signal            from 'fn/signal.js';
import toCamelCase       from 'fn/to-camel-case.js';
import AttributeRenderer, { toAttributeString } from './renderer-attribute.js';
import { stats }         from './renderer.js';


/**
DatasetRenderer(signal, literal, consts, element, name)
Constructs an object responsible for rendering to the `.dataset` property.
**/

export default class DatasetRenderer extends AttributeRenderer {
    constructor(fn, parameters, element, name, debug) {
        super(fn, parameters, element, name, debug, false);

        // data-prop-thing to propThing
        this.property = toCamelCase(name.replace(/^data-/, ''));

        // A synchronous evaluation while data signal value is undefined binds
        // this renderer to changes to that signal, but if signal value is an
        // object it renders immediately.
        Signal.evaluate(this, this.evaluate);
    }

    render(strings) {
        return this.element.dataset[this.property] = this.singleExpression ?
            arguments[1] :
            toAttributeString(arguments) ;
    }
}

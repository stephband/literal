
import id                from '../../../fn/modules/id.js';
import get               from '../../../fn/modules/get.js';
import overload          from '../../../fn/modules/overload.js';
import Signal            from '../../../fn/modules/signal.js';
import config            from '../config.js';
import bindValue         from '../scope/bind-value.js';
import AttributeRenderer, { toAttributeString } from './renderer-attribute.js';
import { stats }         from './renderer.js';
import { getValue, setValue, removeValue } from './value.js';


/**
ValueRenderer(fn, element, unused, parameters)
Constructs an object responsible for rendering from a value attribute to a
value property. Parameter `name` is redundant, but here for symmetry with other
renderers.
**/

const toValue = overload(get('type'), {
    //'date':      composeDate,
    //'select-multiple': composeArray,
    'number':     Number,
    'range':      Number,
    'default':    id
});

export default class ValueRenderer extends AttributeRenderer {
    static parameterNames = ['data', 'DATA', 'element', 'host', 'shadow', 'bind'];

    constructor(signal, literal, parameters, element, name, debug) {
        super(signal, literal, parameters, element, 'value', debug);

        // A synchronous evaluation while data signal value is undefined binds
        // this renderer to changes to signal. If signal has value this also
        // renders the renderer immediately.
        Signal.evaluate(this, this.evaluate);
    }

    render(strings) {
        // If arguments contains a single expression use its value
        const value = toValue(this.element.type, this.singleExpression ?
            arguments[1] :
            toAttributeString(arguments)
        );

        return setValue(this.element, value);
    }

    stop() {
        // Guard against memory leaks by cleaning up $value expando when
        // the renderer is done.
        removeValue(this.element);
        return super.stop();
    }
}

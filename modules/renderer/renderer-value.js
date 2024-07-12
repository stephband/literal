
import id                from '../../../fn/modules/id.js';
import overload          from '../../../fn/modules/overload.js';
import config            from '../config.js';
import bindValue         from '../scope/bind-value.js';
import AttributeRenderer from './renderer-attribute.js';
import { stats }         from './renderer.js';
import composeString     from './compose-string.js';
import composeNumber     from './compose-number.js';
import { getValue, setValue, removeValue } from './value.js';


/**
ValueRenderer(fn, element, unused, parameters)
Constructs an object responsible for rendering from a value attribute to a
value property. Parameter `name` is redundant, but here for symmetry with other
renderers.
**/

const compose = overload((value, type) => type, {
    //'date':      composeDate,
    //'select-multiple': composeArray,
    'number':     composeNumber,
    'range':      composeNumber,
    'default':    composeString
});

/*
    create(element, parameters) {
        return AttributeRenderer.prototype.create.call(this, element, assign({
            // Parameters
            bind: (path, object, to = id, from = id) =>
                bindValue(element, object, path, to, from, setValue)
        }, parameters));
    }
*/

export default class ValueRenderer extends AttributeRenderer {
    static parameterNames = ['data', 'DATA', 'element', 'host', 'shadow', 'bind'];

    constructor(signal, fn, parameters, element) {
        super(signal, fn, parameters, element, 'value');
    }

    render(strings) {
        this.value = this.singleExpression ?
            // Don't evaluate empty space in attributes with a single expression
            arguments[1] :
            compose(arguments, this.element.type) ;

        stats.property += setValue(this.element, this.value);
    }

    stop() {
        // Guard against memory leaks by cleaning up $value expando when
        // the renderer is done.
        removeValue(this.element);
        return super.stop();
    }
}


import id                from '../../../fn/modules/id.js';
import overload          from '../../../fn/modules/overload.js';
import config            from '../config.js';
import bindValue         from '../scope/bind-value.js';
import AttributeRenderer from './renderer-attribute.js';
import composeString     from './compose-string.js';
import composeNumber     from './compose-number.js';
import { getValue, setValue, removeValue } from './value.js';

const assign = Object.assign;


/**
ValueRenderer(source, node, path, name, parameters, message)
Constructs an object responsible for rendering from a value attribute to a
value property.

Parameter `name` is redundant, but here for symmetry with other cloneable
renderers.
**/

const compose = overload((value, type) => type, {
    //'date':      composeDate,
    //'select-multiple': composeArray,
    'number':     composeNumber,
    'range':      composeNumber,
    'default':    composeString
});

export default function ValueRenderer(source, element, name, path, parameters, message) {
    AttributeRenderer.call(this, source, element, name, path, assign({
        // TODO: Experimental!
        bind: (path, object, to = id, from = id) => bindValue(element, object, path, to, from, setValue)
    }, parameters), message);
}

assign(ValueRenderer.prototype, AttributeRenderer.prototype, {
    render: function(strings) {
        this.value = this.singleExpression ?
            // Don't evaluate empty space in attributes with a single expression
            arguments[1] :
            compose(arguments, this.element.type) ;

        //console.trace('ValueRenderer.render()', this.value);

        this.mutations = setValue(this.element, this.value);
        return this;
    },

    stop: function() {
        // Guard against memory leaks by cleaning up $value expando when
        // the renderer is done.
        removeValue(this.element);
        return AttributeRenderer.prototype.stop.apply(this, arguments);
    }
});

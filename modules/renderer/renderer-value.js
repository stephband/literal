
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

export default function ValueRenderer(source, attribute, path, parameters, message) {
    AttributeRenderer.call(this, source, attribute, path, assign({
        // TODO: Experimental!
        bind: (path, to = id, from = id) => bindValue(this.node, this.data, path, to, from, setValue)
    }, parameters), message);
}

assign(ValueRenderer.prototype, AttributeRenderer.prototype, {
    render: function(strings) {
        if (this.singleExpression) {
            // Don't bother evaluating empty space in attributes
            this.value = arguments[1];
        }
        else {
            this.value = compose(arguments, this.node.type);
        }

        this.mutations = setValue(this.node, this.value);
        return this;
    },

    stop: function() {
        // Guard against memory leaks by cleaning up $value expando when
        // the renderer is done.
        removeValue(this.node);
        return AttributeRenderer.prototype.stop.apply(this, arguments);
    }
});

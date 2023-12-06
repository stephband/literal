
import id                from '../../../fn/modules/id.js';
import isDefined         from '../../../fn/modules/is-defined.js';
import trigger           from '../../../dom/modules/trigger.js';
import config            from '../config.js';
import bindChecked       from '../scope/bind-checked.js';
import composeBoolean    from './compose-boolean.js';
import AttributeRenderer from './renderer-attribute.js';

const assign  = Object.assign;


/**
CheckedRenderer()
Constructs an object responsible for rendering to a checked property.
**/

function toString(value) {
    return '' + value;
}

function setChecked(node, value, hasValue) {
        // Value may be a boolean in which case we use it directly
    const checked = typeof value === 'boolean' ? value :
        // If the element has a value attribute defined, we compare against it
        hasValue ?
            // Is value an array of values? It's important to include this here,
            // at least for checkboxes, of which multiple may be checked. It
            // cuts down on tag parsing in lists of inputs.
            node.type === 'checkbox' && value && value.map ?
                value.map(toString).includes(node.value) :
                // Or a string or a number?
                value + '' === node.value :
        // Otherwise treat value as a boolean
        !!value ;

    if (checked === node.checked) {
        return 0;
    }

    node.checked = checked;

    // Optional event hook
    if (config.updateEvent) {
        trigger(config.updateEvent, node);
    }

    // Return DOM mod count
    return 1;
}

export default function CheckedRenderer(source, attribute, path, parameters, message) {
    AttributeRenderer.call(this, source, attribute, path, assign({
        // TODO: Experimental!
        bind: (path, to = id, from = id) => bindChecked(this.node, this.data, path, to, from, setChecked)
    }, parameters), message);

    // Flag whether element has a value attribute
    this.hasValue = isDefined(this.node.getAttribute('value'));
    // Remove checked attribute to prevent flash of unrendered checkiness
    this.node.removeAttribute(this.name);
}

assign(CheckedRenderer.prototype, AttributeRenderer.prototype, {
    render: function(strings) {
        const value = composeBoolean(arguments);
        this.mutations = setChecked(this.node, value, this.hasValue);
        return this;
    }
});

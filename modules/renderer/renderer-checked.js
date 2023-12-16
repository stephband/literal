
import id                from '../../../fn/modules/id.js';
import isDefined         from '../../../fn/modules/is-defined.js';
import trigger           from '../../../dom/modules/trigger.js';
import config            from '../config.js';
import bindChecked       from '../scope/bind-checked.js';
import composeBoolean    from './compose-boolean.js';
import AttributeRenderer from './renderer-attribute.js';
import { getValue }      from './value.js';

const assign  = Object.assign;


/**
CheckedRenderer()
Constructs an object responsible for rendering to a checked property.
**/

function toString(value) {
    return '' + value;
}

function setChecked(element, value, hasValueAttribute) {
        // Value may be a boolean in which case we use it directly
    const checked = typeof value === 'boolean' ? value :
        // If the element has a value attribute defined, we compare against it
        hasValueAttribute ?
            // Is value an array of values? It's important to include this here,
            // at least for checkboxes, of which multiple may be checked. It
            // cuts down on tag parsing in lists of inputs.
            element.type === 'checkbox' && value && value.map ?
                value.map(toString).includes(getValue(element)) :
                // Or a string or a number?
                value + '' === element.value :
        // Otherwise treat value as a boolean
        !!value ;

    // Avoid updating the DOM unnecessarily
    if (checked === element.checked) {
        return 0;
    }

    element.checked = checked;

    // Optional event hook
    if (config.updateEvent) {
        trigger(config.updateEvent, node);
    }

    // Return DOM mod count
    return 1;
}

export default function CheckedRenderer(path, name, source, element, message) {
    AttributeRenderer.call(this, path, 'checked', source, element, message);
    // Flag whether element has a value attribute
    this.hasValue = isDefined(element.getAttribute('value'));
    // Remove checked attribute to prevent Flash Of Unrendered Checkiness
    element.removeAttribute(name);
}

assign(CheckedRenderer.prototype, AttributeRenderer.prototype, {
    parameterNames: ['data', 'DATA', 'element', 'host', 'shadow', 'bind'],

    create: function(element, parameters) {
        return AttributeRenderer.prototype.create.call(this, element, assign({
            // Parameters
            bind: (path, object, to=id, from=id) =>
                bindChecked(element, object, path, to, from, setChecked)
        }, parameters));
    },

    render: function(strings) {
        if (this.singleExpression) {
            // Don't bother evaluating empty space in attributes
            this.value = arguments[1];
        }
        else {
            this.value = composeBoolean(arguments);
        }

        this.mutations = setChecked(this.element, this.value, this.hasValue);
        return this;
    }
});

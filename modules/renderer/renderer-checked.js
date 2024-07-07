
import id                from '../../../fn/modules/id.js';
import isDefined         from '../../../fn/modules/is-defined.js';
import trigger           from '../../../dom/modules/trigger.js';
import config            from '../config.js';
import bindChecked       from '../scope/bind-checked.js';
import composeBoolean    from './compose-boolean.js';
import AttributeRenderer from './renderer-attribute.js';
import { getValue }      from './value.js';


/**
CheckedRenderer(fn, element, unused, parameters)
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

export default class CheckedRenderer extends AttributeRenderer {
    static parameterNames = ['data', 'DATA', 'element', 'host', 'shadow', 'bind'];

    constructor(fn, element, name, parameters) {
        super(fn, element, 'checked', parameters);
        // Flag whether element has a value attribute
        this.hasValue = isDefined(element.getAttribute('value'));
    }

/*
    create(element, parameters) {
        return AttributeRenderer.prototype.create.call(this, element, assign({
            // Parameters
            bind: (path, object, to=id, from=id) =>
                bindChecked(element, object, path, to, from, setChecked)
        }, parameters));
    }
*/
    render(strings) {
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
}


import id                from 'fn/id.js';
import isDefined         from 'fn/is-defined.js';
import Signal            from 'fn/signal.js';
import trigger           from 'dom/trigger.js';
import config            from '../config.js';
import AttributeRenderer from './renderer-attribute.js';
import { toAttributeBoolean } from './renderer-boolean.js';
import { getValue }      from './renderer-value.js';
import { stats }         from './renderer.js';


/**
CheckedRenderer(signal, literal, consts, element)
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
    if (checked === element.checked) return;

    element.checked = checked;
    if (window.DEBUG) ++stats.property;

    // Optional event hook
    if (config.updateEvent) {
        trigger(config.updateEvent, node);
    }
}

export default class CheckedRenderer extends AttributeRenderer {
    constructor(fn, parameters, element, name, compiled) {
        super(fn, parameters, element, 'checked', compiled, false);

        // Flag whether element has a value attribute
        this.hasValue = isDefined(element.getAttribute('value'));

        // A synchronous evaluation while data signal value is undefined binds
        // this renderer to changes to that signal. If signal value is an `data`
        // object it renders the renderer immediately.
        Signal.evaluate(this, this.evaluate);
    }

    render(strings) {
        // If arguments contains a single expression use its value
        const value = this.singleExpression ?
            Boolean(arguments[1]) :
            toAttributeBoolean(arguments) ;

        return setChecked(this.element, value, this.hasValue);
    }
}

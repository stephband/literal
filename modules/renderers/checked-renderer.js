
import isDefined from '../../../fn/modules/is-defined.js';
import trigger   from '../../../dom/modules/trigger.js';
import config    from '../config.js';
import library   from '../library.js';
import compile   from '../compile.js';
import Renderer  from './renderer.js';

const assign = Object.assign;

const rempty = /^\s*$/;

function isNotEmpty(string) {
    return !rempty.test(string);
}


/** 
CheckedRenderer()
Constructs an object responsible for rendering to a plain text attribute.
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
    if (config.changeEvent) { 
        trigger(config.changeEvent, node);
    }

    // Return DOM mod count
    return 1;
}

export default function CheckedRenderer(node, options) {
    Renderer.apply(this, arguments);
    this.name    = 'checked';
    this.literal = options.literal || compile(library, options.source, null, 'arguments[1]', options, this.element);

    const hasValue = isDefined(node.getAttribute('value'));
    this.update  = (value) => setChecked(node, value, hasValue);

    // Negate the effects of having template content in the checked attribute -
    // resetting the form sets it back to attribute state
    node.removeAttribute('checked');
}

assign(CheckedRenderer.prototype, Renderer.prototype, {
    resolve: function renderBoolean(values) {
        if (values.length !== 2 || values[0].find(isNotEmpty)) {
            throw new Error('A checked attribute may contain only one ${ tag }, optionally surrounded by white space');
        }
    
        return values[1];
    }
});

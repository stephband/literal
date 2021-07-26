
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

function setChecked(node, value) {
    const checked = typeof value === 'boolean' ?
            // Where value is a boolean set it directly
            value :
        isDefined(node.getAttribute('value')) ?
            // Otherwise where the value attribute is defined check against
            // the value property
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
    this.literal = options.literal || compile(library, options.consts, options.source, null, 'arguments[1]');
    this.update  = (value) => setChecked(node, value);

    // Negate the effects of having template content in the checked attribute
    //node.checked = false;
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


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

function renderBoolean(values) {
    if (values.length !== 2 || values[0].find(isNotEmpty)) {
        throw new Error('A checked attribute may contain only one ${ tag }, optionally surrounded by white space');
    }

    return values[1];
}


/** 
CheckedRenderer()
Constructs an object responsible for rendering to a plain text attribute.
**/

function setChecked(node, value) {
    // Where value is defined check against it, otherwise
    // value is "on", uselessly. Set checked state directly.
    const checked = isDefined(node.getAttribute('value')) ?
        value + '' === node.value :
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

export default function CheckedRenderer(consts, source, node, path, name = 'checked') {
    Renderer.apply(this, arguments);
    this.render = compile(library, consts, source, null, 'arguments[1]');
    this.update = (value) => setChecked(node, value);
    
    // Negate the effects of having template content in the checked attribute
    node.checked = false;
}

assign(CheckedRenderer.prototype, Renderer.prototype, {
    resolve: function() {
        // Wait for user-side promises to resolve before sending to render
        return Promise
        .all(arguments)
        .then(renderBoolean)
        .then(this.update);
    }
});

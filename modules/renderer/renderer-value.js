
import overload      from '../../../fn/modules/overload.js';
import trigger       from '../../../dom/modules/trigger.js';
import config        from '../config.js';
import library       from '../library-dom.js';
import Renderer      from './renderer.js';
import composeString from './compose-string.js';
import composeNumber from './compose-number.js';

const assign = Object.assign;


/**
ValueRenderer(source, node, path, name, parameters, message)
Constructs an object responsible for rendering from a value attribute to a
value property.

Parameter `name` is redundant, but here for symmetry with other cloneable
renderers.
**/

const types = {
    'number': 'number',
    'range':  'number'
};


/**
setProperty(node, name, value)/
**/

function setProperty(node, value) {
    // Bit of an edge case, but where we have a custom element that has not
    // been upgraded yet, but it gets a property defined on its prototype when
    // it does upgrade, setting the property on the instance now will mask the
    // ultimate get/set definition on the prototype when it does arrive.
    //
    // So don't, if property is not in node. Set the attribute, it will be
    // picked up on upgrade. MEH.
    if (value === null) {
        throw new Error('VALUE');
    }

    //console.log('VALUE', value);
    node.value = value;

    // Return DOM mutation count
    return 1;
}

function setValue(node, value) {
    // Don't render into focused nodes, it makes the cursor jump to the
    // end of the field, and we should cede control to the user anyway
    if (document.activeElement === node) {
        return 0;
    }

    const type = types[node.type];
    value = type === undefined ? value :
        typeof value === type ? value :
        null ;

    // Avoid updating with the same value. Support node values of any type to
    // support custom elements (like <range-control>), as well as values that
    // are always strings
    if (value === node.value || (value + '') === node.value) {
        return 0;
    }

    // Here's how we did it for number
    //if (value === (node.value === '' ? null : +node.value)) { return 0; }

    const count = setProperty(node, value);

    // Optional event hook
    if (config.changeEvent) {
        trigger(config.changeEvent, node);
    }

    // Return DOM mod count
    return count;
}

const compose = overload((value, type) => type, {
    //'date':      composeDate,
    //'select-multiple': composeArray,
    'number':     composeNumber,
    'range':      composeNumber,
    'default':    composeString
});

export default function ValueRenderer(source, node, path, name, parameters, message) {
    Renderer.call(this, source, library, assign({}, parameters, { element: node }), message);
    this.name    = 'value';
    this.node    = node;
    this.path    = path;
}

assign(ValueRenderer.prototype, Renderer.prototype, {
    render: function() {
        const value = compose(arguments, this.node.type);
        this.mutations = setValue(this.node, value);
        return this;
    }
});

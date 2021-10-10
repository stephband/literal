
import trigger   from '../../../dom/modules/trigger.js';
import config    from '../config.js';
import library   from '../library.js';
import compile   from '../compile.js';
import Renderer, { renderString } from './renderer.js';
import analytics from './analytics.js';

const assign = Object.assign;


/** 
ValueRenderer()
Constructs an object responsible for rendering to a plain text attribute.
**/

const rempty = /^\s*$/;

const types = {
    'number': 'number',
    'range':  'number'
};

function addValue(result, value) {
    return result === undefined ? 
        value :
        result + value ;
}

function renderValue(values) {
    const strings = values[0];
    let value = rempty.test(strings[0]) ? undefined : strings[0];
    let n = 0;

    while (strings[++n] !== undefined) {
        value = addValue(value, values[n]);

        if (!rempty.test(strings[n])) {
            value = addValue(value, strings[n]);
        }
    }

    return value;
}


/**
setProperty(node, name, value)/
**/

export function setProperty(node, name, value) {
    // Bit of an edge case, but where we have a custom element that has not
    // been upgraded yet, but it gets a property defined on its prototype when
    // it does upgrade, setting the property on the instance now will mask the
    // ultimate get/set definition on the prototype when it does arrive.
    //
    // So don't, if property is not in node. Set the attribute, it will be
    // picked up on upgrade.
if (value === null) {
    throw new Error('VALUE');
}
//console.log('VALUE', value);
    
    if (name in node) {
        node[name] = value;
    }
    else {
        node.setAttribute(name, value);
    }

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

    const count = setProperty(node, 'value', value);

    // Optional event hook
    if (config.changeEvent) { 
        trigger(config.changeEvent, node);
    }

    // Return DOM mod count
    return count;
}

export default function ValueRenderer(node, options) {
    Renderer.apply(this, arguments);

    this.name      = 'value';
    this.literally = options.literally || compile(library, 'data, state, element', options.source, null, options, node);
    
    // Analytics
    const id = '#' + options.template;
    ++analytics[id].value || (analytics[id].value = 1);
    ++analytics.Totals.value;
}

assign(ValueRenderer.prototype, Renderer.prototype, {
    resolve: function() {
        const value = renderValue(arguments);
        return setValue(this.node, value)
    }
});


/** 
StringValueRenderer()
Constructs an object responsible for rendering to a value property as a string.
**/

export function StringValueRenderer(node, options) {
    Renderer.apply(this, arguments);

    this.name      = 'value';
    this.literally = options.literally || compile(library, 'data, state, element', options.source, null, options, node);
    
    // Analytics
    const id = '#' + options.template;
    ++analytics[id].value || (analytics[id].value = 1);
}

assign(StringValueRenderer.prototype, Renderer.prototype, {
    resolve: function() {
        const value = renderString(arguments);
        return setValue(this.node, value)
    }
});

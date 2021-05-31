
import isDefined from '../../fn/modules/is-defined.js';
import overload  from '../../fn/modules/overload.js';
import trigger   from '../../dom/modules/trigger.js';
import Renderer  from './renderer.js';
import { setProperty, setBooleanProperty, setAttribute } from './dom.js';

const assign  = Object.assign;
const nothing = [];

const config = {
    changeEvent: 'dom-update'
};


/** 
AttributeRenderer()
Constructs an object responsible for rendering to a plain text attribute.
**/

export function AttributeRenderer(fn, path, node, name) {
    Renderer.apply(this, arguments);
    this.update = (value) => setAttribute(node, name, value);
}

assign(AttributeRenderer.prototype, Renderer.prototype);


/** 
BooleanRenderer()
Constructs an object responsible for rendering to a boolean attribute.
**/

export function BooleanRenderer(fn, path, node, name) {
    Renderer.apply(this, arguments);
    this.update = (value) => setBooleanProperty(node, name, value);

    // Remove the boolean until it is processed
    node.removeAttribute(name);
}

assign(BooleanRenderer.prototype, Renderer.prototype);


/** 
TokensRenderer()
Constructs an object responsible for rendering to a token list attribute such
as a class attribute.
**/

const getTokenList = overload((node, name) => name, {
    'class': (node) => node.classList
});

function setTokens(list, cached, tokens, count) {
    // Remove tokens from the cache that are found in new tokens.
    let n = cached.length;
    while (n--) {
        if (tokens.indexOf(cached[n]) !== -1) {
            cached.splice(n, 1);
        }
    }

    // Remove the remainder from the list
    if (cached.length) {
        list.remove.apply(list, cached);
        ++count;
    }

    // Then add the new tokens. The TokenList object ignores tokens it 
    // already contains.
    list.add.apply(list, tokens);
    return ++count;
}

export function TokensRenderer(fn, path, node, name) {
    Renderer.apply(this, arguments);

    // Empty the token list until it is rendered
    node.setAttribute(name, '');

    const list = getTokenList(node, name);
    let cached = nothing;
    this.update = (tokens) => {
        const count = setTokens(list, cached, tokens, 0);
        cached = tokens;
        // Count 1 for removing, 1 for adding
        return count;
    };
}

assign(TokensRenderer.prototype, Renderer.prototype);



/** 
CheckedRenderer()
Constructs an object responsible for rendering to a plain text attribute.
**/

function setChecked(node, value) {
    // Where value is defined check against it, otherwise
    // value is "on", uselessly. Set checked state directly.
    const checked = isDefined(node.getAttribute('value')) ?
        value === node.value :
        value === true ;

    if (checked === node.checked) {
        return 0;
    }

    //const count = setPropertyBoolean('checked', node, checked);
    node.checked = checked;

    // Optional event hook
    if (config.changeEvent) { 
        trigger(config.changeEvent, node);
    }

    // Return DOM mod count
    return 1;//count;
}

export function CheckedRenderer(fn, path, node, name) {
    Renderer.apply(this, arguments);
    this.update = (value) => setChecked(node, value);
}

assign(CheckedRenderer.prototype, Renderer.prototype);


/** 
ValueRenderer()
Constructs an object responsible for rendering to a plain text attribute.
**/

const types = {
    'number': 'number',
    'range':  'number'
};

function setValue(node, value) {
    // Don't render into focused nodes, it makes the cursor jump to the
    // end of the field, and we should cede control to the user anyway
    if (document.activeElement === node) {
        return 0;
    }

    const type = types[node.type] || 'string';

    value = typeof value === type ? value : null ;

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

export function ValueRenderer(fn, path, node, name) {
    Renderer.apply(this, arguments);
    this.update = (value) => setValue(node, value);
}

assign(ValueRenderer.prototype, Renderer.prototype);


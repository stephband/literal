
/** 
A set of DOM functions that are cautious about needlessly setting 
DOM attributes and properties in order to minimise renders and avoid
disrupting user focus
**/

import isDefined from '../../fn/modules/is-defined.js';
import trigger   from '../../dom/modules/trigger.js';


const config = {
    changeEvent: 'dom-update'
};


/** 
isCustomElement(node)
**/

export function isCustomElement(node) {
    // Custom elements are required to have a '-' in their name
    return /-/.test(node.tagName);
}






function getValue(node) {
    // Falsy values, normally empty strings from inputs, but not false or 0,
    // should return undefined, meaning that an empty <input> represents an 
    // undefined property on scope.
    const value = node.value;
    return value || value === 0 || value === false ? value : undefined ;
}

function getValueCheckbox(node) {
    // Check whether value is defined to determine whether we treat
    // the input as a value matcher or as a boolean
    return isDefined(node.getAttribute('value')) ?
        // Return string or undefined
        node.checked ? node.value : undefined :
        // Return boolean
        node.checked ;
}

function getValueRadio(node) {
    if (!node.checked) { return; }

    return isDefined(node.getAttribute('value')) ?
        // Return value string
        node.value :
        // Return boolean
        node.checked ;
}

/*
function getAttributeValue(node) {
    // Get original value from attributes. We cannot read properties here
    // because custom elements do not yet have their properties initialised
    return node.getAttribute('value') || undefined;
}

function readAttributeChecked(node) {
    // Get original value from attributes. We cannot read properties here
    // because custom elements do not yet have their properties initialised
    const value    = node.getAttribute('value');
    const checked  = !!node.getAttribute('checked');
    return value ? value : checked ;
}
*/




/**
setText(node, name, value)/
**/

export function setText(node, value) {
    // Avoid needlessly setting the DOM
    if (value === node.nodeValue) {
        return 0;
    }

    node.nodeValue = value;

    // Return DOM mod count
    return 1;
}


/** 
setAttribute(node, name, value)
**/

export function setAttribute(node, name, value) {
    node.setAttribute(name, value);

    // Return DOM mod count
    return 1;
}


/** 
setClass(node, name, value)
**/

export function setClass(node, name, value) {
    
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
    if (name in node) {
        node[name] = value;
    }
    else {
        node.setAttribute(name, value);
    }

    // Return DOM mutation count
    return 1;
}


/**
setBooleanProperty(node, name, value)/
**/

export function setBooleanProperty(node, name, value) {
    if (name in node) {
        if ((!!value) === node[name]) {
            return 0;
        }

        node[name] = value;
    }
    else if (value) {
        node.setAttribute(name, name);
    }
    else {
        node.removeAttribute(name);
    }

    // Return DOM mutation count
    return 1;
}


/** 
setPropertyValue(node, name, value)
**/

const types = {
    'number': 'number',
    'range':  'number'
};

export function setPropertyValue(node, value) {
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


/** 
setPropertyChecked(node, value)
**/

export function setPropertyChecked(node, name, value) {
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

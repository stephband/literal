/**
<template is="element-template">
Defines a custom element.
**/

import element, { State } from '../dom/modules/element.js';
import defineElement  from './modules/element.js';
import defineProperty from './modules/define-property.js';

const ignore = {
    is:      true,
    tag:     true,
    data:    true,
    loading: true
};

function isDefineableAttribute(attribute) {
    return !ignore[attribute.localName];
    //console.error('<element-template> Cannot define property ' + attribute.localName + '="' + attribute.value + '"');
}

function assignProperty(properties, attribute) {
    properties[attribute.localName] = defineProperty(attribute.localName, attribute.value);
    return properties;
}

export default element('<template is="define-element">', {
    connect: function() {
        const state = State(this);
        const properties = Array.from(this.attributes)
            .filter(isDefineableAttribute)
            .reduce(assignProperty, {}) ;

        defineElement(state.tag, this, properties);
    }
}, {
    tag: {
        /** tag=""
        Defines the tag name of the custom element.
        **/

        attribute: function(value) {
            const state = State(this);
            state.tag = value;
        }
    }
});
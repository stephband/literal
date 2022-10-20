/**
<template is="element-template">
Defines a custom element.

```
<template is="element-template" tag="cool-element" awesome="boolean">
    ...
</template>

<cool-element awesome></cool-element>
```
**/

import element, { getInternals } from '../dom/modules/element.js';
import defineElement  from './modules/define-element.js';
import defineProperty from './modules/define-property.js';

const ignore = {
    is:      true,
    tag:     true,
    loading: true
};

function isDefineableAttribute(attribute) {
    return !ignore[attribute.localName];
    //console.error('<template is="element-template"> Not permitted to define property ' + attribute.localName + '="' + attribute.value + '"');
}

function assignProperty(properties, attribute) {
    properties[attribute.localName] = defineProperty(attribute.localName, attribute.value);
    return properties;
}

export default element('<template is="element-template">', {
    connect: function() {
        const internal = getInternals(this);

        if (!internal.tag) {
            throw new SyntaxError('<template is="element-template"> must have an attribute tag="name-of-element".');
        }

        const properties = Array.from(this.attributes)
            .filter(isDefineableAttribute)
            .reduce(assignProperty, {}) ;

        defineElement(internal.tag, this, properties, 'defined in element-template');
    }
}, {

    /** tag=""
    Defines the tag name of the custom element.
    **/

    tag: {
        attribute: function(value) {
            const internal = getInternals(this);
            internal.tag = value;
        }
    }
}, null, 'documentation – stephen.band/literal/element-template/');

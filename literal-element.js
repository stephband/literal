/**
<template is="literal-element">
Defines a custom element.

```
<template is="literal-element" tag="cool-element" awesome="boolean">
    ...
</template>

<cool-element awesome></cool-element>
```
**/

import element, { getInternals } from '../dom/modules/element.js';
import defineElement      from './modules/element.js';
import defineProperty     from './modules/define-property.js';

// Log registration to console
window.console && window.console.log('%c<literal-element>%c documentation: stephen.band/literal/', 'color: #3a8ab0; font-weight: 600;', 'color: #888888; font-weight: 400;');

const ignored = {
    is:      true,
    tag:     true,
    data:    true,
    loading: true
};

function isDefineableAttribute(attribute) {
    return !ignored[attribute.localName];
    //console.error('<template is="literal-element"> Not permitted to define property ' + attribute.localName + '="' + attribute.value + '"');
}

function assignProperty(properties, attribute) {
    properties[attribute.localName] = defineProperty(attribute.localName, attribute.value);
    return properties;
}

export default element('<template is="literal-element">', {
    connect: function() {
        const internal = getInternals(this);

        if (!internal.tag) {
            throw new SyntaxError('<template is="literal-element"> must have attribute tag="name-of-element"');
        }

        const properties = Array.from(this.attributes)
            .filter(isDefineableAttribute)
            .reduce(assignProperty, {}) ;

        defineElement(internal.tag, this, properties);
    }
}, {
    tag: {
        /** tag=""
        Defines the tag name of the custom element.
        **/
        attribute: function(value) {
            const internal = getInternals(this);
            internal.tag = value;
        }
    }
});

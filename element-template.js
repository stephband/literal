/**
<template is="element-template">

### Define a literal element

This element template defines a `<useless-button>` element, a button that
disables itself when clicked:

```html
<template is="element-template" tag="useless-button">
    <button type="button" disabled="${ data.disabled }">
        <slot></slot>
        ${ events('click', element).each((e) => data.disabled = true) }
    </button>
</template>
```

Now that is pretty useless, but it does demonstrate how element templates are
rendered. First, the `tag` attribute defines the name of the custom element.
Second, the content of the template defines the custom element's shadow DOM.
Third, template tags are rendered in a scope that makes several objects
available. This template refers to:

- `data` – an initially empty object used to store state
- `events()` – a helper function that returns a stream of DOM events
- `element` – a reference to the element the template tag is inside

When the click handler sets `data.disabled = true`, the button's boolean
`disabled` property is enabled.

This custom element can now be used in HTML:

```html
<useless-button>Click me</useless-button>
```

A list of functions and objects available to templates can be found in the
[scope library](#library). You are not forced to use the library: template tags
may contain any valid JavaScript expression, and the library can be customised
with your own functions.

### The `loading` attribute

Custom elements defined by `element-template` have a read-only boolean `loading`
attribute. This is enabled where the shadow DOM contains assets – stylesheets –
that must be loaded:

```html
<template is="element-template" tag="my-element">
    <link href="path/to/stylesheet.css" rel="stylesheet" />
    ...
</template>
```

The `loading` attribute provides a hook for styling to avoid a flash of unstyled
content (which can happen between the time of element upgrade and the time the
stylesheets finish loading and parsing), or to show a loading indicator.

### Custom attributes

Other attributes may be defined by type on `element-template`. These attributes
become attributes and properties of the custom element, as well as properties
of the `data` object inside the template. Here we define a boolean attribute
`nifty`, and use it inside the shadow template:

```html
<template is="element-template" tag="my-paragraph" nifty="boolean">
    <p>This paragraph is ${ data.nifty ? 'pretty nifty' : 'a bit dull' }</p>
</template>
```

Which is authored as any other boolean attribute:

```html
<my-paragraph nifty></my-paragraph>
```

Possible types are:

- `boolean` – a boolean attribute and property
- `number` – a string attribute, numerical property
- `source` – a URL of a file or module, resolving to an object property
- `string` – a string attribute and property
- `tokens` – a tokens attribute, TokenList property, and an array property of `data`


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

        defineElement(internal.tag, this, properties, 'defined by element-template');
    }
}, {

    /** src="url"
    Not yet implemented.
    **/

    /** tag="element-name"
    Defines the name of the custom element.
    **/

    tag: {
        attribute: function(value) {
            const internal = getInternals(this);
            internal.tag = value;
        }
    }
}, null, 'documentation – stephen.band/literal/');

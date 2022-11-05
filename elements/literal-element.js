/**
<template is="literal-element">

A `literal-element` is a template that defines a custom element purely in HTML.
The content of a `literal-element` defines the shadow DOM, and its attributes
define the tag name, attributes and properties of the custom element.

Typically, elements are defined in the `<head>`:

```html
<template is="literal-element" tag="tag-name">
    <slot></slot>
</template>
```

<template is="literal-element" tag="tag-name">
    <slot></slot>
</template>

then used in the `<body>`:

```html
<tag-name>Slotted content</tag-name>
```

<div class="example">
    <tag-name>Slotted content</tag-name>
</div>

### Define a custom element

Let's build a simple DOM clock.

```html
<template is="literal-element" tag="dom-clock">
    <time>${
        setTimeout(() => data.time = window.performance.now(), 1000 - window.performance.now() % 1000),
        Math.round(data.time / 1000)
    }</time>
</template>
```

<template is="literal-element" tag="dom-clock">
    <time>${
        setTimeout(() => data.time = performance.now(), 1000 - performance.now() % 1000),
        Math.round(data.time / 1000) + 's'
    }</time>
</template>

The `tag` attribute defines the tag name `<dom-clock>`. The literal expression
starts a timeout that updates `data.time` at the end of the current second and
returns the rounded value of `data.time`. We can see the result with the HTML:

```html
Current time: <dom-clock></dom-clock>
```

<div class="example">
Current time: <dom-clock></dom-clock>
</div>

A `data` object exists in every template's scope. It is used to store state.

Changes to `data` are tracked. When `data.time` is set by the timer at the end
of the current second, the change is detected, the expression is reevaluated, a
new timer is set, and the new value of `data.time` is rendered.

Template scope contains a number of other [constants](./templates/#library),
and a small library of [helper functions](./templates/#library). The library is
extensible – you can [add your own functions](./templates/#library).

<!--
### Define a customised built-in

Let's take the `<dom-clock>` above. Instead of having it wrap a `<time>` in its
shadow DOM, let's make the custom element itself an instance of `<time>`:

```html
<template is="literal-element" tag="time is dom-time">${
    setTimeout(() => data.time = window.performance.now(), 1000 - window.performance.now() % 1000),
    Math.round(data.time / 1000)
}</template>
```

This defines a so-called customised built-in:

```html
Current time: <time is="dom-time"><time>
```

<template is="literal-element" tag="time is dom-time">${
    setTimeout(() => data.time = window.performance.now(), 1000 - window.performance.now() % 1000),
    Math.round(data.time / 1000)
}</template>

Current time: <time is="dom-time"><time>

Unfortunately Safari does not support customised built-ins.
-->


### The `loading` attribute

Custom elements defined by `literal-element` have a read-only boolean `loading`
attribute. This is enabled when the shadow DOM contains assets – stylesheets –
that must be loaded:

```html
<template is="literal-element" tag="my-element">
    <link href="path/to/stylesheet.css" rel="stylesheet" />
    ...
</template>
```

The `loading` attribute provides a hook to avoid a flash of unstyled content
(which can happen between the time of element upgrade and the time the
stylesheets finish loading) or to provide a loading indicator.

### Custom attributes

Other attributes and properties are defined by attributes on the
`literal-element` in the form `name="type"`, where possible types are:

- `boolean` – a boolean attribute and property
- `number`  – a string attribute, numerical property
- `source`  – a URL of a file or module, resolving to an object property
- `string`  – a string attribute and property
- `tokens`  – a tokens attribute, TokenList property, and an array property of `data`

Let's define a boolean attribute `nifty` on a new custom element:

```html
<template is="literal-element" tag="a-paragraph" nifty="boolean">
    <p>This paragraph is ${ data.nifty ? 'pretty nifty' : 'a bit pants' }.</p>
</template>
```

Which is authored:

```html
<a-paragraph nifty></a-paragraph>
```

<template is="literal-element" tag="a-paragraph" nifty="boolean">
    <p>This paragraph is ${ data.nifty ? 'pretty nifty' : 'a bit pants' }.</p>
</template>

<a-paragraph nifty></a-paragraph>

Click on an instruction to see what happens when the property `nifty` is changed:

<button type="button" style="padding: 0; border: 0; display: block; line-height: inherit; min-height: 0;" onclick="document.querySelector('a-paragraph').nifty = false">`paragraph.nifty = false`</button>
<button type="button" style="padding: 0; border: 0; display: block; line-height: inherit; min-height: 0;" onclick="document.querySelector('a-paragraph').nifty = true">`paragraph.nifty = true`</button>

**/

import element, { getInternals } from '../../dom/modules/element.js';
import defineElement  from '../modules/define-element.js';

const ignore = {
    is:      true,
    tag:     true,
    loading: true
};

function isDefineableAttribute(attribute) {
    return !ignore[attribute.localName];
    //console.error('<template is="literal-element"> Not permitted to define property ' + attribute.localName + '="' + attribute.value + '"');
}

function assignProperty(properties, attribute) {
    if (isDefineableAttribute(attribute)) {
        properties[attribute.localName] = attribute.value;
    }

    return properties;
}

export default element('<template is="literal-element">', {
    connect: function() {
        const internal = getInternals(this);

        if (!internal.tag) {
            throw new SyntaxError('<template is="literal-element"> must have an attribute tag="name-of-element".');
        }

        const properties = Array
            .from(this.attributes)
            .reduce(assignProperty, {}) ;

        // tag, template, lifecycle, properties, log
        defineElement(internal.tag, this, {}, properties);
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

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

### Attributes

Attribute name/type pairs in `attributes` define attributes on the custom
element. The value of these are exposed inside the template as properties of `data`:

```html
<template is="literal-element" tag="say-what" attributes="nifty:boolean">
    <p>This element is ${ data.nifty ? 'pretty nifty' : 'a bit pants' }.</p>
</template>
```

<template is="literal-element" tag="say-what" attributes="nifty:boolean">
    <p>This element is ${ data.nifty ? 'pretty nifty' : 'a bit pants' }.</p>
</template>

Which is authored as:

```html
<say-what nifty></say-what>
```

<div class="example">
    <say-what nifty></say-what>
</div>

Change the property `.nifty` to rerender the shadow DOM:

<button type="button" style="padding: 0; border: 0; display: block; line-height: inherit; min-height: 0;" onclick="document.querySelector('say-what').nifty = false">`element.nifty = false`</button>
<button type="button" style="padding: 0; border: 0; display: block; line-height: inherit; min-height: 0;" onclick="document.querySelector('say-what').nifty = true">`element.nifty = true`</button>

Possible types are:

- `boolean` – a boolean attribute, boolean property
- `number`  – a string attribute, number property
- `url`     – a URL of a file or module, resolving to an object
- `string`  – a string attribute, string property
- `tokens`  – a tokens attribute, TokenList property


<!--
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

**/


import capture        from '../../fn/modules/capture.js';
import get            from '../../fn/modules/get.js';
import last           from '../../fn/modules/last.js';
import nothing        from '../../fn/modules/nothing.js';
import create         from '../../dom/modules/create.js';
import element, { getInternals } from '../../dom/modules/element.js';
import { rewriteURL } from '../modules/urls.js';
import defineElement  from '../modules/define-element.js';

const ignore = {
    is:          true,
    loading:     true
};

const rhashsplit = /^[^#]*#(.*$)/;

const resolved = Promise.resolve();

function isDefineableAttribute(attribute) {
    return !ignore[attribute.name];
    //console.error('<template is="literal-element"> Not permitted to define property ' + attribute.localName + '="' + attribute.value + '"');
}

function assignProperty(properties, attribute) {
    if (isDefineableAttribute(attribute)) {
        properties[attribute.name] = attribute.value;
    }

    return properties;
}

//                                1              2
const parseNameValues = capture(/^([\w-]+)(?:\s*:\s*(\w+))?\s*;?\s*/, {
    // Attribute name
    1: (namevalues, captures) => {
        namevalues.push({
            name: captures[1]
        });
        return namevalues;
    },

    2: (namevalues, captures) => {
        const namevalue = last(namevalues);
        namevalue.value = captures[2];
        return namevalues;
    },

    done: (namevalues, captures) => {
        return captures[0].length < captures.input.length ?
            parseNameValues(namevalues, captures) :
            namevalues ;
    }
});

export default element('<template is="literal-element">', {
    connect: function() {
        const internals = getInternals(this);

        if (!internals.tag) {
            throw new SyntaxError('<template is="literal-element"> must have an attribute tag="name-of-element".');
        }

        const attributes = internals.attributes ?
            internals.attributes.reduce(assignProperty, {}) :
            nothing ;

        if (internals.src) {
            internals.src.then((lifecycle) =>
                defineElement(internals.tag, this, lifecycle, attributes, internals.parameters, internals.stylesheets)
            );
        }
        else {
            defineElement(internals.tag, this, {}, attributes, internals.parameters, internals.stylesheets);
        }
    }
}, {

    /** tag="element-name"
    Defines the name of the custom element.
    **/

    tag: {
        attribute: function(value) {
            const internal = getInternals(this);
            internal.tag = value;
        }
    },

    attributes: {
        attribute: function(value) {
            const internal = getInternals(this);
            internal.attributes = parseNameValues([], value);
        }
    },

    /** src="url"
    Defines a JS module used as the element's lifecycle.
    **/

    src: {
        attribute: function(value) {
            const internal = getInternals(this);
            const split    = rhashsplit.exec(value);
            const name     = split && split[1] ? split[1] : 'default' ;

            internal.src = import(rewriteURL(value))
                .catch((e) => {
                    throw new Error('<' + internal.tag + '> not defined, failed to fetch src "' + value + '" ' + e.message);
                })
                .then(get(name))
                .catch((e) => {
                    throw new Error('<' + internal.tag + '> not defined, src module "' + value + '" has no "' + name + '" export ' + e.message);
                });
        }
    },

    /** scope="element-name"
    Optional JavaScript module whose exports are made available in the template
    scope.
    **/

    scope: {
        attribute: function(value) {
            this.scope = value;
        },

        get: function() {
            const internals = getInternals(this);
            return internals.scope ;
        },

        set: function(value) {
            const internals = getInternals(this);

            // Let flow run for a tick before importing, so that there is time
            // for url rewrites to be populated. I don't like this much...
            //internals.module = resolved
            //    .then(() => import(rewriteURL(value)))
            internals.parameters = import(rewriteURL(value))
                .catch((e) => console.error(e)) ;
        }
    },

    /** stylesheets="url"
    A list of stylesheets urls. They are loaded before the element is defined,
    preventing a flash of unstyled content.
    **/

    stylesheets: {
        attribute: function(value) {
            const internals = getInternals(this);
            internals.stylesheets = value.split(/\s+/);
        }
    }
}, null, 'documentation – stephen.band/literal/');

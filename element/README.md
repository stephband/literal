
## `element()`

Literal wraps the mega-splat of the various Custom Elements APIs into a single
`element()` function that aims to make the whole palaver a million times easier
by cleaning up some gotchas, pitfalls and idiosyncrasies en route.

### How it works

Import the `element()` function, define, register and export a custom element.
Take this `<toggle-button>` definition, for example:

```js
// Import the element() function
import element from '/literal/build/element.js';

// Register <toggle-button> and export its constructor
export default element(
    // Element name
    "<toggle-button>",
    // Define the shadow DOM as a literal template
    { shadow: "<p>${ host.active ? 'on' : 'off' }</p>" },
    // Define a boolean attribute and property `active`
    { active: "boolean" }
);
```

This defines `<toggle-button>` as an element with one boolean attribute and
property `active`. Its shadow DOM is rendered from a literal template which has
access to a `host` object, the element, and renders "on" when `.active` is
`true`, and "off" when `.active` is `false`.

```html
<toggle-button active>
```

```js
const toggle = document.querySelector('toggle-button');
toggle.active = true;
```

### Attributes and properties

The third parameter to `element()` is an object of attribute and property
definitions. Literal allows a number of string types as a shorthand for common
definitions.

- `"attribute"` - defines a string attribute (only)
- `"property"` - defines a property (only)
- `"boolean"` - defines a boolean attribute and a boolean property
- `"number"` - defines a string attribute and a number property
- `"string"` - defines a string attribute and string property
- `"tokens"` - defines a tokens attribute (think `class`) and a string setter / TokenList getter property
- `"src"`    - defines a URL attribute that links to a data property (TODO)
- `"module"` - defines a URL attribute that ... (TODO)
- `"data"` - defines a property exposing literal's `data` object. Setting this
property to an object changes the data being rendered. Getting this property
returns literal's `data` proxy of the object.

This is useful if you are building a closed system where literal custom elements
are authored inside literal templates, as data can be passed efficiently from
template to custom element shadow DOM by the renderer.

```js
export default element("<show-text>", {
    shadow: "<p>${ data.text }</p>"
}, {
    data:   "data"
});
```

```html
<template is="literal-html">
    <p>Data has the text "<show-text data="${ data }"><show-text>"</p>
</template>
```

It is probably less useful for publishing custom elements intended for general
consumption.

Changes to properties defined in this way are signalled to Literal's renderer.
Literal updates the shadow DOM (not the whole thing, just the parts that need
updating) on the next animation frame after a change.


### The element lifecycle

The second parameter to `element()` is a lifecycle object. Apart from the shadow
template the lifecycle object may contain optional callback functions.

```js
{
    shadow:     // literal html string or '#template-id' or fragment node
    focusable:  // true or false
    mode:       // 'open' or 'closed' TODO: are we gonna go with open: true?

    // Lifecycle handlers
    construct:  // fn called during element construction
    connect:    // fn called when element added to DOM
    disconnect: // fn called when element removed from DOM
    load:       // fn called when stylesheets have loaded

    // If the element is form-enabled
    enable:     // fn called when form element enabled
    disable:    // fn called when form element disabled
    reset:      // fn called when form element reset
    restore:    // fn called when form element restored
}
```

All callbacks are called with the context `this` set as the element and
`shadow, internals, data` as arguments.


### Observing standard properties

Changes to standard properties such as `title` are not observed. Title can be
accessed inside the template as `${ host.title }`, obviously, but Literal can
only react to `toggle.setAttribute('title', 'text')` and `toggle.title = 'text';`
where `title` is redefined as an observable property.

```js
export default element("<toggle-button>", {
    shadow: "<p>${ host.active ? 'on' : 'off' }</p>"
}, {
    active: "boolean",
    title:  "string"
});
```

In practise this is barely noticeable: it's rare you need to observe any of the
standard attributes.


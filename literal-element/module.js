/**
<template is="literal-element">

An HTML template that declares a custom element. Its `tag` attribute, required,
declares the tag name of new custom element, and the content of the template
defines its shadow DOM:

```html
<template is="literal-element" tag="dom-clock">
    <time>${ clock(1).map(floor) } seconds</time>
</template>
```

<template is="literal-element" tag="dom-clock" attributes="interval:number">
    <time>${ clock(data.interval).map(floor) } seconds</time>
</template>

Here the expression `${ clock(1) }` is a stream of times that emits a new time
every `1` second (template scope contains a [small library of functions](./templates/#library)
that help do this sort of thing). The declared element may now be written:

```html
<p>Current time: <dom-clock></dom-clock></p>
```

Current time: <dom-clock interval="1"></dom-clock>

Now for the sake of argument, let's say we want to give `<dom-clock>` an
`interval` attribute, and make it available as a number inside the template
scope:

```html
<template is="literal-element" tag="dom-clock" attributes="interval:number">
    <time>${ clock(data.interval).map(floor) } seconds</time>
</template>
```

That may now be authored:

```html
<p>Current time: <dom-clock interval="3"></dom-clock></p>
```

<p>Current time: <dom-clock interval="3"></dom-clock></p>
**/



/*

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

*/


import element    from '../../dom/modules/element.js';
import lifecycle  from './modules/lifecycle.js';
import properties from './modules/properties.js';

export default element('<template is="literal-element">', lifecycle, properties, null, 'stephen.band/literal/');

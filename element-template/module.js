/**
<template is="element-template">

An HTML template that declares a new custom element. Its `tag` attribute, which
is required, declares the tag name of the new custom element, and the content of
the template defines the shadow DOM:

```html
<template is="element-template" tag="dom-clock">
    <time>${ time(1) } seconds</time>
</template>
```

<template is="element-template" tag="dom-clock" attributes="interval:number">
    <time>${ time(data.interval) } seconds</time>
</template>

Here the expression `${ time(1) }` is a stream of times that emits a new time
every second (template scope contains a [small library of functions](./templates/#library)
that help do this sort of thing). The declared element may now be written:

```html
<p>Current time: <dom-clock></dom-clock></p>
```

Current time: <dom-clock interval="1"></dom-clock>

Now for the sake of argument, let's say we want to give `<dom-clock>` an
`interval` attribute, available as a number inside the template scope:

```html
<template is="element-template" tag="dom-clock" attributes="interval:number">
    <time>${ time(data.interval) } seconds</time>
</template>
```

That may now be authored:

```html
<p>Current time: <dom-clock interval="0.2"></dom-clock></p>
```

<p>Current time: <dom-clock interval="0.2"></dom-clock></p>

The new custom element may be made to load stylesheets before it is upgraded,
preventing a flash of unstyled content, using the `stylesheets` attribute, and
it may have a lifecycle and scope variables defined in a JS module declared via
the `src` attribute.
**/



/*

### The `loading` attribute

Custom elements defined by `element-template` have a read-only boolean `loading`
attribute. This is enabled when the shadow DOM contains assets – stylesheets –
that must be loaded:

```html
<template is="element-template" tag="my-element">
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

export default element('<template is="element-template">', lifecycle, properties, null, 'stephen.band/literal/');

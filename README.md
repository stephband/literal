# Literal <span class="text-06">0.6.5</span>

Literal puts JS into HTML templates. Literal enhances **HTML `<template>`s**
with **JS template literals**, a **DOM renderer**, and a scope of **helper
functions** for writing concise, powerful expressions.


#### [`<template is="literal-html">`](https://stephen.band/literal/literal-html/)

A `literal-html` template acts as an **include**, enabling you to place dynamic
content pretty much anywhere in your HTML. It is replaced in the DOM with its
own rendered content.

```html
<template is="literal-html" data="./package.json">
    <h2>${ data.title }</h2>
</template>
```


#### [`<template is="literal-element">`](https://stephen.band/literal/literal-element/)

A `literal-element` template defines a **custom element** and its **shadow DOM**.
In HTML.

```html
<!-- in the head -->
<template is="literal-element" tag="my-element" attributes="active:boolean">
    <p>Shadow DOM for ${ host.tagName }</p>
    <slot hidden="${ !data.active }"></slot>
</template>

<!-- in the body -->
<my-element active>
    <p>Slotted content shown when active.</p>
</my-element>
```


### Get started

Import and define the Literal template elements to start rendering them.

```html
<script type="module">
    // Import and define <template is="literal-html">
    import './build/literal-html/module.js';
    // Import and define <template is="literal-element">
    import './build/literal-element/module.js';
</script>
```


### [Template scope, functions and expressions](https://stephen.band/literal/templates/)

Literal templates are compiled in a scope that has a number of **functions** and
**objects** for writing powerful expressions concisely.

The `data` object holds data to bind to:

```html
<template is="literal-html" data="./package.json">
    <h2>${ data.title }</h2>
    <p>${ data.version }</p>
</template>
```

The `include()` function includes other templates:

```html
<template is="literal-html">
    <!-- Include a template -->
    ${ include('#template-id', data) }

    <!-- Include a template and render it when JSON data is fetched -->
    ${ include('#template-id', './package.json') }

    <!-- Include a template for each object in an array -->
    ${ data.array.map(include('#template-id')) }
</template>
```

Listen to DOM events by creating an `events()` stream:

```html
<template is="literal-html">
    <!-- Listen to events -->
    ${ events('click', element).each((e) => { ... }) }

    <!-- Map a stream of events to text -->
    ${ events('change', element).map((e) => e.target.value) }
</template>
```

Read more [template functions and expressions](https://stephen.band/literal/templates/).

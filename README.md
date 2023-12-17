
# Literal <span class="text-06">0.8.1</span>

Literal is a DOM-first templating library that enhances **HTML `<template>`s**
with **JS literal expressions** and renders them with a
**data binding DOM&nbsp;renderer**.

- [`<template is="literal-html">` documentation](https://stephen.band/literal/literal-html/)
- [`<template is="literal-element">` documentation](https://stephen.band/literal/literal-element/)
- [Scope and expressions](https://stephen.band/literal/templates/)
- [Repository on github.com](https://github.com/stephband/literal/)


## Quick start

### `<template is="literal-html">`

A `literal-html` template is replaced in the DOM with its own rendered content.
HTML `<template>`s are allowed pretty much anywhere in a document, so
`literal-html` templates enable you to freely mix islands of dynamically
rendered content into your HTML.

Import `literal-html/module.js` to start rendering `literal-html` templates:

```html
<script type="module" src="./build/literal-html/module.js"></script>
```

Every Literal template has a `data` object. In this example the default export
of `clock.js` is imported as `data` and its `time` property rendered:

```html
<template is="literal-html" src="./build/data/clock.js">
    <p>${ data.time.toFixed(0) } seconds since page load.</p>
</template>
```
<div class="demo-block block">
<template is="literal-html" src="./build/data/clock.js">
    <p>${ data.time.toFixed(0) } seconds since page load.</p>
</template>
</div>

When no data is explicitly imported Literal renders the template with an
empty `data` object. In this example `data` is not used, and the template
renders a stream of pointer events:

```html
<template is="literal-html">
    <p>${ events('pointermove', body).map((e) => round(e.pageX)) }px</p>
</template>
```
<div class="demo-block block">
<template is="literal-html">
    <p>${ events('pointermove', body).map((e) => round(e.pageX)) }px</p>
</template>
</div>

Templates can `include()` other templates. Here, `data` is imported from a JSON
file and an array of tasks is mapped to a collection of `<li>`s:

```html
<template id="li-template">
    <li>${ data.text }</li>
</template>

<template is="literal-html" src="./data/todo.json">
    <ul>${ data.tasks.map(include('#li-template')) }</ul>
</template>
```
<div class="demo-block block">
<template id="li-template">
    <li>${ data.text }</li>
</template>

<template is="literal-html" src="./data/todo.json">
    <ul>${ data.tasks.map(include('#li-template')) }</ul>
</template>
</div>


- Read more about [`literal-html` templates](https://stephen.band/literal/literal-html/)
- Read more about [Literal template expressions](https://stephen.band/literal/templates/)

### `<template is="literal-element">`

A `literal-element` template declares a **custom element** and defines its
**shadow DOM**, allowing you to author custom elements entirely within HTML.

Import `literal-element/module.js` to start rendering `literal-element` elements:

```html
<script type="module" src="./build/literal-element/module.js"></script>
```

Here's a declaration of a bare-bones '`<my-toggle>`' element. It is recommended
to put these in the `<head>`, but you don't have to.

```html
<template is="literal-element" tag="my-toggle" attributes="active:boolean">
    <button type="button">
        <!-- Render button text -->
        ${ data.active ? 'Hide' : 'Show' } slotted content
        <!-- Listen to events on the button -->
        ${ events('click', element).each(() => data.active = !data.active) }
    </button>
    <slot hidden="${ !data.active }"></slot>
</template>
```

The custom element can now be authored as:

```html
<my-toggle>
    <p>This paragraph is shown when my-toggle is active.</p>
</my-toggle>
```

<div class="demo-block block">
<template is="literal-element" tag="my-toggle" attributes="active:boolean">
    <button type="button">
        <!-- Render button text -->
        ${ data.active ? 'Hide' : 'Show' } slotted content
        <!-- Listen to events on the button -->
        ${ events('click', element).each(() => data.active = !data.active) }
    </button>
    <slot hidden="${ !data.active }"></slot>
</template>
<my-toggle>
    <p>This paragraph is shown when my-toggle is active.</p>
</my-toggle>
</div>

- Read more about [`literal-element` templates](https://stephen.band/literal/literal-element/)
- Read more about [Literal template expressions](https://stephen.band/literal/templates/)

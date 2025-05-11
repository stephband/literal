
# Literal <span class="text-06">0.8.3</span>

Literal enhances the **`<template>` element** with **JS literal expressions**
and **incremental DOM rendering** in reaction to changes in a **signal graph**.

- [`<template is="literal-html">` documentation](https://stephen.band/literal/literal-html/)
- [Scope and expressions in Literal templates](https://stephen.band/literal/templates/)
- [Repository on github.com](https://github.com/stephband/literal/)


## Quick start

### `<template is="literal-html">`

A `literal-html` template is replaced in the DOM with its own rendered content.
HTML `<template>`s are allowed pretty much anywhere in a document, so
`literal-html` templates enable you to freely mix islands of dynamically
rendered content into your HTML.

Import `literal-html/element.js` to start rendering `literal-html` templates:

```html
<script type="module" src="./build/literal-html/element.js"></script>
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

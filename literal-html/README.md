
## `<template is="literal-html">`

A `literal-html` template is replaced in the DOM with its own rendered content.
HTML `<template>`s are allowed pretty much anywhere in a document, so
`literal-html` templates enable you to freely mix islands of dynamically
rendered content into your HTML.


### Install `literal-html`

Importing `literal-html/module.js` registers `<template is="literal-html">` as
a customised built-in template element. Support is polyfilled in Safari (who
[refuse to implement customised built-ins](https://github.com/WebKit/standards-positions/issues/97]).

```html
<script type="module" src="./build/literal-html/module.js"></script>
```


### Author a `literal-html` template

Where no `src` or `data` attribute is declared the template is rendered
immediately with an empty `data` object. The rendered content replaces the
template in the DOM:

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


### Import JSON data

The `src` attribute imports data from a JSON file or JS module. Imported data
is available inside the template as the `data` object:

```html
<template is="literal-html" src="../package.json">
    <p>${ data.title }</p>
</template>
```
<div class="demo-block block">
<template is="literal-html" src="../package.json">
    <p>${ data.title }</p>
</template>
</div>

Imported data objects are cached. Other templates importing from an identical
URL share the same `data` object. Changes made to `data` inside a template are
seen by all templates rendering that data:

```html
<template is="literal-html" src="../package.json">
    <label>Title</label>
    <input type="text" value="${ bind('title', data) }" />
</template>
```
<div class="demo-block block">
<template is="literal-html" src="../package.json">
    <label>Title</label>
    <input type="text" value="${ bind('title', data) }" />
</template>
</div>


### Import a JS module

A `src` attribute pointing to a JS module imports the default export of that
module:

```html
<template is="literal-html" src="../build/data/clock.js">
    <p>${ data.time }</p>
</template>
```
<div class="demo-block block">
<template is="literal-html" src="../build/data/clock.js">
    <p>${ data.time }</p>
</template>
</div>

Use a fragment identifier to import a named export:

```html
<template is="literal-html" src="../build/data/clock.js#something">
    <p>${ data.time }</p>
</template>
```
<div class="demo-block block">
<template is="literal-html" src="../build/data/clock.js#somethin">
    <p>${ data.time }</p>
</template>
</div>


### Include other templates

Expressions can `include()` other templates by id. Included templates need no
special attributes but are nonetheless parsed as Literal templates.

```html
<template id="li-template">
    <li>${ data.text }</li>
</template>

<template is="literal-html" src="../data/todo.json">
    <ul>${ data.tasks.map(include('#li-template')) }</ul>
</template>
```
<div class="demo-block block">
<template id="li-template">
    <li>${ data.text }</li>
</template>
<template is="literal-html" src="../data/todo.json">
    <ul>${ data.tasks.map(include('#li-template')) }</ul>
</template>
</div>

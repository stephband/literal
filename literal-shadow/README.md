
## `<template is="literal-shadow">`

A `literal-shadow` template is replaced in the DOM with its own rendered content.
HTML `<template>`s are allowed pretty much anywhere in a document, so
`literal-shadow` templates enable you to freely mix islands of dynamically
rendered content into your HTML.


### Register `literal-shadow`

Importing `./build/literal-shadow/module.js` from the [repository](https://github.com/stephband/literal/)
registers `<template is="literal-shadow">` as a customised built-in template
element. (Support is polyfilled in Safari, who [refuse to implement customised built-ins](https://github.com/WebKit/standards-positions/issues/97])).

```html
<script src="https://stephen.band/literal/build/literal-shadow/module.js" type="module"></script>
```


### Author a `literal-shadow` template

```html
<article>
    <template is="literal-shadow">
        <p>${ events('pointermove', body).map((e) => round(e.pageX)) }px</p>
    </template>
</article>
```
<div class="demo-block block">
<article>
    <template is="literal-shadow">
        <p>${ events('pointermove', body).map((e) => round(e.pageX)) }px</p>
    </template>
</article>
</div>


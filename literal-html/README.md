
## `<template is="literal-html">`

A `literal-html` template is replaced in the DOM with its own rendered content.
HTML `<template>`s are allowed pretty much anywhere in a document, so
`literal-html` templates enable you to freely mix islands of dynamically
rendered content into your HTML.


### Register `literal-html`

Importing `./build/literal-html/module.js` from the [repository](https://github.com/stephband/literal/)
registers `<template is="literal-html">` as a customised built-in template
element. (Support is polyfilled in Safari, who [refuse to implement customised built-ins](https://github.com/WebKit/standards-positions/issues/97])).

```html
<script src="https://stephen.band/literal/build/literal-html/module.js" type="module"></script>
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


### Import a JS module

A `src` attribute pointing to a JS module imports the default export of that
module:

```html
<template is="literal-html" src="../build/data/clock.js">
    <p>${ data.time.toFixed(0) }</p>
</template>
```
<div class="demo-block block">
<template is="literal-html" src="../build/data/clock.js">
    <p>${ data.time.toFixed(0) }</p>
</template>
</div>

A named export can be imported using a fragment identifier:

```html
<template is="literal-html" src="../data/cart.js#items">
    <p>Items in cart: ${ data.length }</p>
    <p>${ data.map((item) => `${ item.quantity } x ${ item.product.name }`).join(', ') }</p>
</template>
```
<div class="demo-block block">
<template is="literal-html" src="../data/cart.js#items">
    <p>Items in cart: ${ data.length }</p>
    <p>${ data.map((item) => `${ item.quantity } x ${ item.product.name }`).join(', ') }</p>
</template>
</div>


### Share `data` across templates

Imported data objects are cached. Other templates importing from the same
resource share the same `data` object. Changes made to `data` inside a template
are seen by all templates rendering that data:

```html
<template is="literal-html" src="../package.json">
    <label>Title (first template)</label>
    <input type="text" value="${ bind('title', data) }" />
</template>

<template is="literal-html" src="../package.json">
    <label>Title (second template)</label>
    <input type="text" value="${ bind('title', data) }" />
</template>
```
<div class="demo-block block">
<template is="literal-html" src="../package.json">
    <label>Title (first template)</label>
    <input type="text" value="${ bind('title', data) }" />
</template>

<template is="literal-html" src="../package.json">
    <label>Title (second template)</label>
    <input type="text" value="${ bind('title', data) }" />
</template>
</div>


### Include other templates

Expressions can `include()` other templates that are in the DOM by id. Included
templates need no special attributes but when included they are parsed as
Literal templates.

```html
<template id="todo-li">
    <li>${ data.text }</li>
</template>

<template is="literal-html">
    <h5>Todo list</h5>
    <ul>${ include('#todo-li', { text: 'Wake up' }) }</ul>
</template>
```
<div class="demo-block block">
<template is="literal-html">
    <h5>Todo list</h5>
    <ul>${ include('#todo-li', { text: 'Wake up' }) }</ul>
</template>
<template id="todo-li">
    <li>${ data.text }</li>
</template>
</div>


The `include(src, data)` function is partially applicable, which is helpful for
mapping an array of objects to template includes:

```html
<template is="literal-html" src="../data/todo.json">
    <h5>Todo list</h5>
    <ul>${ data.tasks.map(include('#todo-li')) }</ul>
</template>
```
<div class="demo-block block">
<template is="literal-html" src="../data/todo.json">
    <h5>Todo list</h5>
    <ul>${ data.tasks.map(include('#todo-li')) }</ul>
</template>
</div>

Note that the included template `#todo-li` is not removed from the DOM. It is
recommended to place templates intended as includes in the document `<head>`.


### Show errors and logs

If `window.DEBUG = true` at time the element is registered, and the stylesheet
`./build/debug.css` is imported, some debugging features are available. Compile
and render times are logged to the console. Open the console now to see compile
and render logs for the Literal templates on this page.

In addition a `literal-html` template will render some error messages to the
DOM. If a `literal-html` template cannot find `src` data it is replaced with:

```html
<template is="literal-html" src="../does-not-exist.json">
    <h5>Not rendered</h5>
</template>
```
<div class="demo-block block">
<template is="literal-html" src="../does-not-exist.json">
    <h5>Not rendered</h5>
</template>
</div>

Where `window.DEBUG` is not set, nothing is rendered. Frankly, error messaging
and could be improved, and [maybe you could help](https://github.com/stephband/literal/).


### Print debug information

More debugging information can be printed to the DOM using the `print()` function:

```html
<template is="literal-html" src="../data/cart.js#items">
    ${ print(data) }
</template>
```
<div class="demo-block block">
<template is="literal-html" src="../data/cart.js#items">
    ${ print(data) }
</template>
</div>

Again, where `window.DEBUG` is not set, nothing is rendered.


### A quick example

Turn a `<time>` element into a clock face:

```html
<template id="clock-hands">
    <time class="clock" datetime="${ data.toISOString() }">
        <span class="hour-clock-hand   clock-hand" style="transform: rotate(${ 30 * (data.getHours()   % 12) }deg);">${ data.getHours()   } hours</span>
        <span class="minute-clock-hand clock-hand" style="transform: rotate(${ 6  * (data.getMinutes() % 60) }deg);">${ data.getMinutes() } minutes</span>
        <span class="second-clock-hand clock-hand" style="transform: rotate(${ 6  * (data.getSeconds() % 60) }deg);">${ data.getSeconds() } seconds</span>
    </time>
</template>

<template is="literal-html">
    ${ clock(1).start().map(() => include('#clock-hands', new Date())) }
</template>
```
<div class="demo-block block">
<template id="clock-hands">
    <time class="clock" datetime="${ data.toISOString() }">
        <span class="hour-clock-hand   clock-hand" style="transform: rotate(${ 30 * (data.getHours()   % 12) }deg);">${ data.getHours()   } hours</span>
        <span class="minute-clock-hand clock-hand" style="transform: rotate(${ 6  * (data.getMinutes() % 60) }deg);">${ data.getMinutes() } minutes</span>
        <span class="second-clock-hand clock-hand" style="transform: rotate(${ 6  * (data.getSeconds() % 60) }deg);">${ data.getSeconds() } seconds</span>
    </time>
</template>
<template is="literal-html">
    ${ clock(1).start().map(() => include('#clock-hands', new Date())) }
</template>
</div>

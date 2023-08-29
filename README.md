# Literal <span class="text-06">0.6.5</span>

Literal puts JS into HTML templates. Literal enhances **HTML `<template>`s**
with **JS template literals** and a scope of **functions** for writing concise
expressions, and renders them with a **live DOM renderer**.

Start authoring with one of Literal's customised built-in templates.


#### [`<template is="literal-html">`](https://stephen.band/literal/literal-html/)

A `literal-html` template is replaced in the DOM with its own rendered content,
enabling you to place dynamic content pretty much anywhere in your HTML.

```html
<template is="literal-html" data="./package.json">
    <!-- Render some data -->
    <h2>${ data.title } <span class="text-06">${ data.version }</span></h2>
</template>

<!-- Import literal-html to start rendering -->
<script type="module" src="./build/literal-html/module.js"></script>
```

<div class="demo-block block">
    <template is="literal-html" data="./package.json">
        <!-- Render some data -->
        <h2>${ data.title } <span class="text-06">${ data.version }</span></h2>
    </template>
</div>

[Read the `literal-html` documentation](https://stephen.band/literal/literal-html/).


#### [`<template is="literal-element">`](https://stephen.band/literal/literal-element/)

A `literal-element` template defines a **custom element** and its **shadow DOM**.
Here's a definition of a bare-bones show/hide '`<my-toggle>`' element:

```html
<template is="literal-element" tag="my-toggle" attributes="active:boolean">
    <button type="button">
        <!-- Render button text -->
        ${ data.active ? 'Hide' : 'Show' } slotted content
        <!-- Listen to events on the button -->
        ${ events('click', element).each(() => (data.active = !data.active)) }
    </button>
    <!-- Boolean attributes take a single truthy/falsy expression -->
    <slot hidden="${ !data.active }"></slot>
</template>

<my-toggle active>
    <p>Content is shown when my-toggle is active.</p>
</my-toggle>

<!-- Import literal-element to define <my-toggle> -->
<script type="module" src="./build/literal-element/module.js"></script>
```

<div class="demo-block block">
    <template is="literal-element" tag="my-toggle" attributes="active:boolean">
        <button type="button">
            <!-- Render button text -->
            ${ data.active ? 'Hide' : 'Show' } slotted content
            <!-- Listen to events on the button -->
            ${ events('click', element).each(() => (data.active = !data.active)) }
        </button>
        <!-- Boolean attributes understand a single truthy/falsy expression -->
        <slot hidden="${ !data.active }"></slot>
    </template>
    <my-toggle active>
        <p>Content is shown when my-toggle is active.</p>
    </my-toggle>
</div>

[Read the `literal-element` documentation](https://stephen.band/literal/literal-element/).


### [Template scope, functions and expressions](https://stephen.band/literal/templates/)

Literal templates are compiled in a scope that has a number of **functions** and
**objects** for writing powerful expressions concisely. For example, the `data`
object holds data to bind to:

```html
<h2>${ data.title }</h2>
<p>${ data.version }</p>
```

The `include()` function includes other templates:

```html
<!-- Include a template -->
${ include('#template-id', data) }
<!-- Include a template and render it when JSON data is fetched -->
${ include('#template-id', './package.json') }
<!-- Include a template for each object in an array -->
${ data.array.map(include('#template-id')) }
```

Listen to DOM events by creating an `events()` stream:

```html
<!-- Listen to events -->
${ events('click', element).each((e) => { ... }) }
<!-- Map a stream of events to text -->
${ events('change', element).map((e) => e.target.value) }
```

[Read the template scope and expressions documentation](https://stephen.band/literal/templates/).

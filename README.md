# Literal <span class="text-06">0.6.5</span>

Literal puts JS into HTML templates. Literal enhances **HTML `<template>`s**
with **JS template literals** and a scope of **functions** for writing concise
expressions, and renders them with a **live DOM renderer**.

Start authoring with one of Literal's customised built-in templates.


### `<template is="literal-html">`

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

Read the [`literal-html` documentation](https://stephen.band/literal/literal-html/).


### `<template is="literal-element">`

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

<!-- Import literal-element to define <my-toggle> -->
<script type="module" src="./build/literal-element/module.js"></script>
```

Which is then authored as:

```html
<my-toggle>
    <p>Content is shown when my-toggle is active.</p>
</my-toggle>
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
    <my-toggle>
        <p>Content is shown when my-toggle is active.</p>
    </my-toggle>
</div>

Read the [`literal-element` documentation](https://stephen.band/literal/literal-element/).


## Template scope and expressions

Literal templates are compiled in a **scope** that contains a number of **objects**
and **functions** designed for writing concise template **expressions**.

Expressions are made powerful by Literal's renderer, which accepts expressions
that evaluate to a **string** or other **primitive**, a **DOM node** or **fragment**,
an **array** of values, another **renderer**, or even an asynchronous value in a
**promise** or a **stream**. This makes it possible to, for example, include
other templates or listen to DOM events inside expressions:

```html
<!-- Include another template -->
${ include('#template-id', data) }

<!-- Listen to an event stream -->
${ events('click', element).each((e) => { ... }) }
```

Read the [Template Scope and Expressions documentation](https://stephen.band/literal/templates/).

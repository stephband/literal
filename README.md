# Literal

Literal puts JS into your HTML. Literal customises the template element,
enhancing it with the native capabilities of JS template tags to render fast, 
flexible and powerful templates.


## Literal templates in HTML

Import Literal.

```html
<script type="module" src="./module.js"></script> 
```

This registers two custom elements, `&lt;template&gt;` and
`&lt;literal-include&gt;`.

```html
<!-- Define a template -->
<template id="title-template">
    <h1>I am ${ data.title }</h1>
</template>

<!-- Include the template -->
<literal-include src="#title-template" data="./package.json"></literal-include>
```

A `&lt;literal-include&gt;` is replaced with the rendered content of its `src` 
template as soon as `data` is fetched. In the example above, when `package.json` 
is fetched the include renders to the DOM as

```html
<h1>I am Literal</h1>
```

A `&lt;template&gt;` may be reused by multiple 
`&lt;literal-include&gt;`s.


### The data attribute or attributes

A `&lt;literal-include&gt;` may have either a `data` attribute or one or more
`data-` attributes (but not both). Data attributes may contain

- a URL pointing to a `.json` file
- a URL pointing to a `.js` module with a default export
- a primitive (a number, string, boolean, or null)
- some JSON

Where a single `data` attribute is used, the object `data` inside a template 
refers to the imported object.

```html
<template id="title-template">
    <h1>I am ${ data.title }</h1>
</template>

<literal-include src="#title-template" data="./package.json"></literal-include>
```

Where dataset (`data-`) attributes are used, the object `data` inside a 
template is given properties with corresponding names.

```html
<template id="title-template">
    <h1>I am ${ data.package.title }. Number is ${ data.number }</h1>
</template>

<literal-include src="#title-template" data-package="./package.json" data-number="1"></literal-include>
```



## Literal functions

A number of functions are available as a base library inside the template.

### assign()
As `Object.assign()`.

### by()
by

### define()
As `Object.define()`.

### entries()
As `Object.entries()`.

### em()
Takes a numeric value in px, or a string value of the form `'10px'` and outputs
a string value in em, eg. `'0.625em'`.

### equals(a, b)
Compares a and b for deep equality.

### get(path, object)
Gets the value of `path` in `object`, where `path` is in dot-notation. 

### id(object)
Returns `object`.

### include(src, data)
Includes another template. Not available inside attributes.

### keys()
As `Object.keys()`.

### last()
Gets the last item from an array or array-like.

### matches(selector, object)
Returns true where all the properties of `selector` are strictly equal to the 
same properties of `object`.

### noop()
Return undefined.

### observe(path, object)
Returns an observable of mutations to `path` in `object`. Consume mutations
with its `.each()` method.

```
observe('title', data).each((title) => console.log(title));
```

Observables may be stopped when the render is over by subscribing them using the
current renderer's `.done()` method.

```
this.done( observe('title', data).each((title) => console.log(title)) );
```

### Observer(object)
Returns the Observer proxy of `object`. Use this proxy to make changes to object
that may be observed using `observe(path, object)` (above).

### overload(fn, object)

### print(object)
Prints renderers and objects to the DOM. To debug a template in place, print the
current renderer and data.

```
${ print(this, data) }
```

### px()
Takes a numeric value in px, or a string value of the form `'0.625rem'` and 
outputs a string value in px, eg. `'10px'`.

### rem()
Takes a numeric value in px, or a string value of the form `'10px'` and outputs
a string value in em, eg. `'0.625rem'`.

### request(url)
Fetches `.json` or imports a `.js` module's default export, returning a promise.

### slugify(string)
Returns the slug of `string`.

### values()
As `Object.values()`.






### &lt;include src="#template-id"&gt;

Include tags, found only in unrendered literal templates, are replaced on render 
with their source content. Like the literal template, they support the `src` 
and `data` attributes. Indeed, an include requires a `src` attribute.

```html
<template id="description">
    <p>${ description }</p>
</template>

<template data="./package.json">
    <h1>${ title }</h1>
    <include src="#description"></include>
</template>
```

### Live updates

There is a subtle difference between data access via `${ data.title }` and 
via `${ title }` – constants are not observed for live data-binding. 

Behind the scenes accesses to the main `data` object are recorded on each 
render, allowing Literal to know exactly which attributes and text nodes
need to be rendered or ignored when data mutates. Constants are removed 
from this process. They are re-rendered only when a) they are in an attribute
or text node containing another tag that has been flagged for render or 
b) when an entirely new data object is passed to the template (in JS 
via `render(data)`).

Incidentally, immutable objects such as frozen objects are not observed for 
data-binding, that wouldn't make sense. Literal is comfortable working
mutably or immutably.

## Literal templates in JS

Import the Literal constructor and render a template:

```js
import Literal from './module.js';

const render = Literal('#my-template');

render({ name: 'Literal' }).then((nodes) => {
    // Do something with the generated nodes
});
```

The Literal constructor accepts an identifier in the form `'#template-id'`,
a reference to a template element, or an HTML string.

## Literal for Deno

Literal comes with a build script for the static render of files with a 
`.literal` extension. Files are built in place without the extension 
in the same location. Literal will render `.html.literal`, `.css.literal`, 
`.svg.literal` and other `.literal` files.

```
> make literal
```

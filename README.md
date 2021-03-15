# Literal

Literal templates for the DOM and for Node.


### The literal-template element

Register the `literal-template` (customised built-in) element:

```html
<script type="module" src="./elements/literal-template.js"></script> 
```

A `literal-template` is declared using the `is` attribute on a `<template>` 
element:

```html
<template is="literal-template" data="./package.json">
    <h1>${ data.title }</h1>
</template>
```

Literal templates are replaced with their rendered content as soon as data 
becomes available. When `package.json` is fetched the HTML above renders to 
the DOM as:

```html
<h1>Literal</h1>
```

#### `data` attribute

The `data` attribute accepts a url to request some JSON:

```html
<template is="literal-template" data="./package.json">
    <ul>
        <li>${ data.name }</li>
    </ul>
</template>
```

The `data` attribute may also contain a literal tag, which can be used to 
inject any old data for the template's scope.

```html
<template is="literal-template" data="${ window.location }">
    <h1>${ data.href }</h1>
</template>
```

A template tag may evaluate to a promise, so `fetch` and `import` may be
employed to get data:

```html
<template is="literal-template" data="${ import('./module.js') }">
    <p>${ data }</p>
</template>
```

Use `data-` attributes to declare properties of `data` as constants inside the 
template:

```html
<template is="literal-template" data="./package.json" data-title data-description>
    <h1>${ title }</h1>
    <p>${ description }</p>
</template>
```

Note that constants are not observed for live data-binding. They are useful 
for rendering data that is known not to mutate. Incidentally, immutable 
objects such as frozen objects are not observed for data-binding either, that 
wouldn't be sensible.


#### `src` attribute

The `src` attribute imports another template referenced by id:

```html
<template id="header">
    <h1>${ data.title }</h1>
    <p>${ description }</p>
</template>

<template is="literal-template" src="#header" data="./package.json"></template>
```


### Literal()

Import Literal:

```js
import Literal from './module.js';
```


## Literal in Node

Build all files in the directory tree with the extension `.literal` to their
built equivalent without the extension in the same location. Literal will render 
`.html.literal`, `.css.literal`, `.svg.literal` and other `.literal` files.

```js
node ./index.js
```

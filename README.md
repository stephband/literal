# literal

Literal templates for the DOM.


### Literal()

Import Literal:

```js
import Literal from './module.js';
```


### The `literal-template` element

Register the `literal-template` (customised built-in) element:

```html
<script type="module" src="./elements/literal-template.js"></script> 
```

A `literal-template` is declared via the `is` attribute on a `<template>` element:

```html
<template is="literal-template" data="${ import('package.json') }">
    <h1>${ data.name }</h1>
</template>
```

Literal templates are replaced with their rendered content. The HTML above 
renders to the DOM as:

```html
<h1>Literal</h1>
```



## Literal in Node




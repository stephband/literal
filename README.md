# Literal

Literal puts JS into your HTML. Literal customises the template element,
enhancing it with the native capabilities of JS template tags to render fast, 
flexible and powerful templates, all in a small library that is just 10kB 
minified and gzipped.


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


## Literal templates in HTML

Register the `literal-template` (customised built-in) element:

```html
<script type="module" src="./elements/literal-template.js"></script> 
```

### &lt;template is="literal-template"&gt;

A literal template is declared using the `is` attribute:

```html
<template is="literal-template" data="./package.json">
    <h1>${ data.title }</h1>
</template>
```

Literal templates are replaced with their rendered content as soon as data 
becomes available. In the example above, when `package.json` is fetched 
the template renders to the DOM as:

```html
<h1>Literal</h1>
```

### data="url"

The `data` attribute accepts a url to request some JSON. The resulting object
is available inside the template as `data`:

```html
<template is="literal-template" data="./package.json">
    <ul>
        <li>${ data.name }</li>
    </ul>
</template>
```

### data="${...}"

The `data` attribute may also contain a literal tag, which can be used to 
inject any old data for the template's scope.

```html
<template is="literal-template" data="${ window.location }">
    <h1>${ data.href }</h1>
</template>
```

A literal tag may evaluate to a promise, so `fetch` and `import` can be
employed to import data:

```html
<template is="literal-template" data="${ import('./module.js') }">
    <p>${ data }</p>
</template>
```

### data-xxx

`data-xxx` attributes define properties of `data` as constants for use inside 
a template:

```html
<template is="literal-template" data="./package.json" data-title data-description>
    <h1>${ title }</h1>
    <p>${ description }</p>
</template>
```


### src="#template-id"

The `src` attribute includes some other template referenced by id:

```html
<template id="header">
    <h1>${ data.title }</h1>
    <p>${ description }</p>
</template>

<template is="literal-template" src="#header" data="./package.json"></template>
```


### &lt;include src="#template-id"&gt;

Include tags, found only in unrendered literal templates, are replaced on render 
with their source content. Like the literal template, they support the `src` 
and `data` attributes. Indeed, an include requires a `src` attribute.

```html
<template id="description">
    <p>${ description }</p>
</template>

<template is="literal-template" data="./package.json">
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

## Literal for Deno

Literal comes with a build script for the static render of files with a 
`.literal` extension. Files are built in place without the extension 
in the same location. Literal will render `.html.literal`, `.css.literal`, 
`.svg.literal` and other `.literal` files.

```
> make literal
```

# Literal

Literal sticks JS into your HTML. Literal uses the native capabilities of JS 
to compile and render fast and powerful templates.


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

A Literal template tag may evaluate to a promise, so `fetch` and `import` can be
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

### Data binding

There is a subtle difference between data access via `${ data.title }` and 
via `${ title }`. Constants are not observed for live data-binding. 

Behind the scenes accesses to the main `data` object are recorded on each 
render, allowing literal to know exactly which attributes and text nodes
need to be rendered or ignored when data mutates. Constants are removed 
from this process. They are re-rendered only when a) they are in an attribute
or text node containing another template tag that has mutated or b) when
an entirely new data object is passed to the template (in JS via `render(data)`).

Incidentally, immutable objects such as frozen objects are not observed for 
data-binding, that wouldn't make sense. <!--It is perfectly performant to be
using Literal as an immutable rendering library.-->


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


## Literal for NodeJS

Build all files in the directory tree with the extension `.literal` to their
built equivalent without the extension in the same location. Literal will render 
`.html.literal`, `.css.literal`, `.svg.literal` and other `.literal` files.

```
> node ./index.js
```

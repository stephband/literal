# Literal

Literal sticks JS into your HTML. Literal uses the native capabilities of JS 
to render fast and powerful template literals into the DOM.


## Literal templates in HTML

Register the `literal-template` (customised built-in) element:

```html
<script type="module" src="./elements/literal-template.js"></script> 
```

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

The `data` attribute accepts a url to request some JSON:

```html
<template is="literal-template" data="./package.json">
    <ul>
        <li>${ data.name }</li>
    </ul>
</template>
```

### data="${value}"

The `data` attribute may also contain a literal tag, which can be used to 
inject any old data for the template's scope.

```html
<template is="literal-template" data="${ window.location }">
    <h1>${ data.href }</h1>
</template>
```

A template tag may evaluate to a promise, so `fetch` and `import` can be
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

Constants are not observed for live data-binding. They are useful 
for rendering data that is known not to mutate. Incidentally, immutable 
objects such as frozen objects are not observed for data-binding either, that 
wouldn't be sensible.


### src="#template-id"

The `src` attribute includes some other template referenced by id:

```html
<template id="header">
    <h1>${ data.title }</h1>
    <p>${ description }</p>
</template>

<template is="literal-template" src="#header" data="./package.json"></template>
```


### <include>

Include tags, like the literal template, are replaced on render with
their source content. Like the literal template, they support the `src` 
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

## Literal constructor in JS

Literal may be used without the custom element interface. Import the Literal 
constructor and render a template:

```js
import Literal from './module.js';

const render = Literal('#my-template');

render({ name: 'Literal' }).then((node) => {
    // Do something with the generated nodes
});
```

The Literal constructor accepts an identifier in the form `'#template-id'`,
a reference to a template element, or an HTML string.


## Literal for NodeJS

Build all files in the directory tree with the extension `.literal` to their
built equivalent without the extension in the same location. Literal will render 
`.html.literal`, `.css.literal`, `.svg.literal` and other `.literal` files.

```js
node ./index.js
```

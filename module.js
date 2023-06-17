

/**
Get Started

Import Literal from the main module in the repo:

```
import 'http://stephen.band/literal/module.js';
```

<p class="right-bubble bubble">Clearly you should not rely on this resource in
production. Use a bundler such as <a href="https://esbuild.github.io/">esbuild</a>
to package it into your own module.</p>

And grab the associated CSS:

```css
@import 'http://stephen.band/literal/module.css';
```

<p class="right-bubble bubble">Clearly you should not rely on this resource in
production. Use a bundler to package it into your own CSS.</p>

This registers the custom element `<literal-include>`. Here is how to use it:

```html
<template id="item">
    <li>${ data.text }</li>
</template>

<template id="todo-list">
    <p>Todo list: ${ data.title }</p>
    <ul>${ data.tasks.map(include('#item')) }</ul>
</template>

<literal-include src="#todo-list" data="./data/todo.json">
    <p>Fallback content.</p>
</literal-include>
```

A `<literal-include>` is replaced with the content of its `src` template when
its `data` is fetched and rendered. Inside the template, data to render
is accessed through the variable `${ data }`. The result of this example is:

<template id="item">
    <li>${ data.text }</li>
</template>

<template id="author">
    <p>Todo list: ${ data.title }</p>
    <ul>${ data.tasks.map(include('#item')) }</ul>
</template>

<literal-include src="#author" data="./data/todo.json">
    <p>Fallback content.</p>
</literal-include>

The template renderer observes `data` objects and updates the DOM if changes are
detected. In the following example a mutating `data` object is imported from a
JS module and used to rotate an SVG:

```html
<template id="clock">
    <svg style="transform: rotate(${ round(data.time) * 6 + 'deg'});" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" fill="white" />
        <line x1="12" y1="12" x2="12" y2="1" />
    </svg>
    <p>You loaded this <b>${ round(data.time) + 's' }</b> ago.</p>
</template>

<literal-include src="#clock" data="./data/clock.js">
    <p>You loaded this.</p>
</literal-include>
```

And the result is:

<template id="clock">
    <svg style="transform: rotate(${ round(data.time) * 6 + 'deg'});" viewBox="0 0 24 24" width="32" height="32">
        <circle cx="12" cy="12" r="11" fill="white" stroke-width="2" />
        <line x1="12" y1="12" x2="12" y2="1" stroke-width="1" />
    </svg>
    <p>You loaded this <b>${ round(data.time) + 's' }</b> ago.</p>
</template>

<literal-include src="#clock" data="./data/clock.js">
    <p>You loaded this.</p>
</literal-include>
**/

/**
Enhancing content

Let's consider a classic  'favourites' button. The static version is a link to
the `/favourites/` page represented by an icon:

```html
<a href="/favourites/" class="fav-icon">Favourites</a>
```

<div class="example">
    <a href="/favourites/" class="fav-icon">
        Favourites
    </a>
</div>

We want to enhance that link with a badge that displays a count of our
favourites, so we use an `literal-template` to render a `<span>` containing the
count inside the link:

```html
<a href="/favourites/" class="fav-icon">
    Favourites
    <template is="literal-template" data="../data/favourites.js">
        <span class="badge">${ data.count }</span>
    </template>
</a>
```

<div class="example">
    <a href="/favourites/" class="fav-icon">
        Favourites
        <template is="literal-template" data="../data/favourites.js">
            <span class="badge">${ data.count }</span>
        </template>
    </a>
</div>

This count comes from the module at `../data/favourites.js`. That module also
has a `toggle()` method that we may use to add or remove ids from a list of
favourites, enabling us to write a favourite button:

```html
<template is="literal-template" data="../data/favourites.js">
    <button type="button">
        ${ data.ids.includes('a') ? 'Remove from favourites' : 'Add to favourites' }
        ${ events('click', element).each((e) => data.toggle('a')) }
    </button>
</template>
```

<div class="example">
    <template is="literal-template" data="../data/favourites.js">
        <button type="button" class="${ data.ids.includes('a') ? 'fav' : 'not-fav' }">
            ${ data.ids.includes('a') ? 'Remove from favourites' : 'Add to favourites' }
            ${ events('click', element).each((e) => data.toggle('a')) }
        </button>
    </template>
</div>

Note how the badge in the favourites link is updated when this is clicked.

## Importing production modules

URLs to modules may be rewritten, which is useful if you are bundling modules
for production. Rather than having to rewrite the HTML with new data URLs,
Literal provides an `urls` map:

```js
import { urls } from '../module.js';

assign(urls, {
    // Map the default export of favourites.js to the export
    // named 'favourites' of bundle.js...
    '../data/favourites.js': '../build/bundle.js#favourites'
});

```
**/

/*
Contents
- <a href="#literal-include">`<literal-include>`</a>
- <a href="#template-functions">Literal template functions</a>
*/

export { default as observe }         from '../fn/observer/observe.js';
export { Observer as Data }           from '../fn/observer/observer.js';
export { default as Renderer }        from './modules/renderer-template.js';
export { compiled }                   from './modules/compile.js';
export { default as library }         from './modules/library.js';
export { urls }                       from './modules/urls.js';


/**
Get Started

Import Literal from the main module in the repo:

```js
import 'http://stephen.band/literal/module.js';
```

<p class="right-bubble bubble">Clearly you should not rely on this resource in production. Use a bundler 
such as <a href="https://esbuild.github.io/">esbuild</a> to package it into your 
own module.</p>

This registers two custom elements:

`<template is="literal-template">`<br/>
`<literal-include>`

Here is how to use them:

```html
<template is="literal-template" id="item">
    <li>${ data.text }</li>
</template>

<template is="literal-template" id="todo-list">
    <p>Todo list: ${ data.title }</p>
    <ul>${ data.tasks.map(include('#item')) }</ul>
</template>

<literal-include src="#todo-list" data="./data/todo.json">
    <p>Fallback content.</p>
</literal-include>
```

A `literal-include` is replaced with the content of its `src` template when 
its `data` is fetched and rendered. Inside a `literal-template`, data to render 
is accessed through the variable `${ data }`. The result of this example is:

<template is="literal-template" id="item">
    <li>${ data.text }</li>
</template>

<template is="literal-template" id="author">
    <p>Todo list: ${ data.title }</p>
    <ul>${ data.tasks.map(include('#item')) }</ul>
</template>

<literal-include src="#author" data="./data/todo.json">
    <p>Fallback content.</p>
</literal-include>
**/

/*
The template renderer observes `data` objects and updates the DOM if changes are 
detected. In the following example a mutating `data` object is imported from a 
JS module:

```html
<template is="literal-template" id="clock">
    <svg style="transform: rotate(${ round(data.time) * 6 + 'deg'});" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="11" fill="white" />
        <line x1="12" y1="12" x2="12" y2="1" />
    </svg>
    <p>You loaded this <b>${ round(data.time) + 's' }</b> ago.</p>
</template>

<literal-include src="#clock" data="./data/dom-clock.js">
    <p>You loaded this.</p>
</literal-include>
```

And the result is:

<template is="literal-template" id="clock">
    <svg style="transform: rotate(${ round(data.time) * 6 + 'deg'});" viewBox="0 0 24 24" width="32" height="32">
        <circle cx="12" cy="12" r="11" fill="white" stroke-width="2" />
        <line x1="12" y1="12" x2="12" y2="1" stroke-width="1" />
    </svg>
    <p>You loaded this <b>${ round(data.time) + 's' }</b> ago.</p>
</template>

<literal-include src="#clock" data="./data/dom-clock.js">
    <p>You loaded this.</p>
</literal-include>
*/

/**
Contents
- <a href="#literal-template">`<template is="literal-template">`</a>
- <a href="#functions">Literal template functions</a>
- <a href="#literal-include">`<literal-include>`</a>
**/

import './elements/literal-template.js';
import './elements/literal-include.js';

export { cache as compiled } from './modules/compile.js';
export { register } from './modules/library.js';

import analytics from './modules/analytics.js';
export { analytics };



/*

Inside a `<template is="literal-template">`, data is accessed through the 
variable `${ data }`. Templates also contain some useful functions, such as the 
`${ include() }` function, used to nest one template inside another:

```html
<template is="literal-template" id="link">
    <a href="${ data.url }">${ data.name }</a>
</template>

<template is="literal-template" id="author">
    <p>${ include('#link', data.author) } made this.</p>
</template>

<literal-include src="#author" data="./package.json">
    <p>Fallback content.</p>
</literal-include>
```

Which renders as:

<template is="literal-template" id="link">
    <a href="${ data.url }">${ data.name }</a>
</template>

<template is="literal-template" id="author">
    <p>${ include('#link', data.author) } made this.</p>
</template>

<literal-include src="#author" data="./package.json">
    <p>Fallback content.</p>
</literal-include>
*/

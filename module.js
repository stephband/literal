
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

<literal-include src="#clock" data="./data/dom-clock.js">
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

<literal-include src="#clock" data="./data/dom-clock.js">
    <p>You loaded this.</p>
</literal-include>
**/

/*
Contents
- <a href="#literal-include">`<literal-include>`</a>
- <a href="#template-functions">Literal template functions</a>
*/

import include from './library/include.js';
import request from './library/request.js';
import events  from '../dom/modules/events.js';

/* Importing literal-include registers – and instantiates – <literal-include> */
import './elements/literal-include.js';

export { cache as compiled } from './modules/compile.js';
import { register } from './modules/library.js';

import analytics from './modules/analytics.js';
export { analytics };

register('include', include);
register('request', request);
register('events',  events);

export { register };
import TemplateRenderer from './modules/renderers/template-renderer.js';
export const Template = TemplateRenderer;

export { Observer }  from '../fn/observer/observer.js';
export { default as observe } from '../fn/observer/observe.js';

export default function Literal(id) {
    return new TemplateRenderer(id);
}

Literal.stats = analytics;

if (window.DEBUG) {
    window.Literal = Literal;
}

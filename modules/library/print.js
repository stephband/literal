
/**
Template debugging

Where `window.DEBUG` is truthy at the time Literal is loaded (or where Literal
is built into a module with the environment variable `DEBUG` set to `true`),
the function `print(object)` prints an object or objects to the DOM as a debug
message.

```html
<template id="debug">
    <!-- `this` is the renderer -->
    ${ print(this, data) }
</template>

<include-template src="#debug" data="./package.json"></include-template>
```

Renders as:

<template id="debug">
    ${ print(this, data) }
</template>

<include-template src="#debug" data="./package.json"></include-template>

<!--
Messages should be styled with the print stylesheet:

```css
@import "http://stephen.band/literal/modules/library/print.css";
```-->

Where `window.DEBUG` is false, `print()` does nothing.
**/

import noop          from '../../../fn/modules/noop.js';
import { getTarget } from '../../../fn/observer/observer.js';

function toHTML(object) {
    // Print different kinds of objects differently
    if (typeof object === 'object' && object.template) {
        return '<strong>' + object.id + '</strong> #' + object.template + ' <small>&gt; ' + object.path.replace('.', ' &gt; ') + '</small> <strong class="literal-count">' + object.count + '</strong>';
    }

    if (typeof object === 'object' && object.message) {
        return '<code class="red-bg white-fg"><strong>' + object.constructor.name + '</strong> ' + object.message + '</code>';
    }

    if (typeof object === 'object') {
        return '<code><strong>' + object.constructor.name + '</strong> ' + JSON.stringify(object) + '</code>';
    }
}

export default window.DEBUG ? function print(object) {
    // Print renderer
    const pre = document.createElement('pre');
    let html = '';

    if (object instanceof Error) {
        pre.setAttribute('class', 'literal-print-error literal-print');
        html += '<strong>' + object.constructor.name + '</strong>';
        html += '<code>' + object.message + '</code>';
    }
    else {
        let n = -1;
        pre.setAttribute('class', 'literal-print');
        while (arguments[++n] !== undefined) {
            html += toHTML(getTarget(arguments[n]));
        }
    }

    pre.innerHTML = html;
    return pre;
} : noop ;

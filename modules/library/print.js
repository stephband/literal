
/**
print(context, data)

Where `window.DEBUG` was falsy at the time Literal is imported, `print()` does
nothing.

Prints an object or objects to the DOM as a debug message.

```html
<template id="debug">${ print(data) }</template>
<template-include src="#debug" data="../package.json"></template-include>
```

Renders as:

<template id="debug">
    ${ print(data) }
</template>

<template-include src="#debug" data="../../package.json"></template-include>

<!--
Messages should be styled with the print stylesheet:

```css
@import "http://stephen.band/literal/modules/library/print.css";
```-->


**/

import noop          from '../../../fn/modules/noop.js';
import { getTarget } from '../../../fn/observer/observer.js';

function toHTML(object) {
    // Print different kinds of objects differently
    if (typeof object === 'object' && object.template) {
        return '<strong>' + object.id + '</strong> ' + object.template + ' <small>&gt; ' + object.path + '</small> <!--strong class="literal-count">' + object.count + '</strong-->';
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

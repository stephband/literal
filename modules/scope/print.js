
/**
print(data)
Prints an object or objects to the DOM as a debug message.

```html
<template is="literal-html" data="../../package.json">
    ${ print(data) }
</template>
```

Renders as:

<template is="literal-html" data="../../../package.json">
    ${ print(data) }
</template>

<!--
Messages should be styled with the print stylesheet:

```css
@import "http://stephen.band/literal/modules/scope/print.css";
```-->


**/

import noop    from '../../../fn/modules/noop.js';
import Data    from '../../../fn/modules/signal-data.js';
import create  from '../../../dom/modules/create.js';
import { log } from '../log.js';

function toHTML(object) {
    // Print different kinds of objects differently
    if (typeof object === 'object' && object.template) {
        return '<strong>' + object.id + '</strong> ' + object.template + ' <small>&gt; ' + object.path + '</small> <!--strong class="literal-count">' + object.count + '</strong-->';
    }

    if (typeof object === 'object' && object.message) {
        return '<code class="white-fg">' + object.message + '</code>';
    }

    if (typeof object === 'object') {
        return '<code><strong>' + object.constructor.name + '</strong> ' + JSON.stringify(object) + '</code>';
    }
}

export function printRenderError(error, renderer, data) {
    // Extract template id. TODO: Must be a better way to pass these around.
    log('error', renderer.message.replace(/&nbsp;.*$/, '').replace(/&gt;/g, '>').replace(/<\/?small>/g, ''), '', '', 'red');
    console.log(error);
    // TODO: get the data in here!
    //console.log(data);

    const element = create('pre', {
        class: 'literal-error',
        html: renderer.message + '<code>'
            +'<strong>' + error.constructor.name + '</strong> '
            + error.message
            + '</code>'
    });

    return element;
}

export function printError(error, renderer) {
    const element = document.createElement('pre');
    let html = '';

    element.setAttribute('class', 'literal-error');
    element.innerHTML = '<strong>' + error.constructor.name + '</strong>'
    + '<code>' + error.message + '</code>' ;

    console.error(error);
    return element;
}

export function printDebug(object) {
    // Print renderer
    const pre = document.createElement('pre');
    let n = -1;

    pre.setAttribute('class', 'literal-print');
    while (arguments[++n] !== undefined) {
        html += toHTML(Data.objectOf(arguments[n]));
    }

    pre.innerHTML = html;
    return pre;
}

export default function print(object) {
    return object instanceof Error ?
        printError(object) :
        printDebug(object) ;
}

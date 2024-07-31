
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
@import "http://stephen.band/literal/modules/print.css";
```-->
**/

import noop    from 'fn/noop.js';
import Data    from 'fn/data.js';
import create  from 'dom/create.js';
import { log } from './log.js';

const linkHTML = '<a class="literal-link" href="https://stephen.band/literal/literal-html/">literal</literal>';

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

export function printError(renderer, error) {
    // TODO: get the data in here!

    //const fullpath = renderer.path
    //    + (typeof renderer.name === 'string' ? '>' + renderer.name : '') ;

    log('error', renderer.template + ' – ' + renderer.code, '', '', 'red');
    console.log(error);

    return create('pre', {
        class: 'literal-error',
        html: renderer.template
            //+ ' <small>&gt; ' + fullpath.replace(/>/g, ' &gt ') + '</small>'
            //+ '&nbsp;&nbsp;'
            + ' <small class="literal-message">' + renderer.code.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</small>'
            + '<code>'
            + '<strong>' + error.constructor.name + '</strong> '
            + error.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            + '</code>'
            + linkHTML
    });
}

export function printDebug(renderer, object) {
    const fullpath = renderer.path
        + (typeof renderer.name === 'string' ? '>' + renderer.name : '') ;

    let n = 0;
    let html = '';
    while (arguments[++n] !== undefined) {
        html += toHTML(arguments[n]);
    }

    return create('pre', {
        class: 'literal-print',
        html: renderer.template
            + ' <small>' + (fullpath ? '&gt; ' + fullpath.replace(/>/g, ' &gt ') : '') + '</small>'
            //+ '&nbsp;&nbsp;'
            //+ ' <small class="literal-message">' + renderer.code.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</small>'
            + '<span class="literal-count">' + renderer.renderCount + '</span>'
            + html
            + linkHTML
    });
}

export default function print(renderer, object) {
    return object instanceof Error ?
        printError(renderer, object) :
        printDebug(renderer, object) ;
}


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
**/

import noop    from 'fn/noop.js';
import Data    from 'fn/data.js';
import create  from 'dom/create.js';
import { log } from './log.js';

const assign = Object.assign;

const literalCSS = {
    'box-sizing':    'border-box',
    'position':      'relative',
    'display':       'block',
    /* Try to not interfere with layout of surrounding content too much */
    'overflow':      'hidden',
    'break-inside':  'avoid',
    'width':         '100%',
    'justify-self':  'stretch',
    'align-self':    'start',
    'text-align':    'left',
    'font-size':     '0.75rem',
    'font-family':   '"Fira Mono", Menlo, Monaco, "Andale Mono", monospace',
    'font-weight':   'normal',
    'letter-spacing': '-0.05em',
    'line-height':   '1.5rem',
    'border-width':  '0',
    /* Bottom left corner underlaps <code> corner, we give it a slightly bigger
       radius to avoid aliasing this background color through the edge. */
    'border-radius': '0 0.5rem 0 0.6875rem',
    'padding':       '0 0.375rem'
};

const literalLinkCSS = {
    'box-sizing':    'border-box',
    'position':      'absolute',
    'bottom':        '0.25rem',
    'right':         '0.25rem',
    'z-index':       '2',
    'padding-left':  '0',
    'padding-right': '0',
    'font-size':     '0.6875em',
    'font-family':   '"Fira Mono", Menlo, Monaco, "Andale Mono", monospace',
    'line-height':   '1em',
    'opacity':       '0.86666667',
    'color':         '#81868f',
    'background-color': 'transparent',
    'text-decoration': 'none'
};

const literalSmallCSS = {
    'box-sizing':   'border-box',
    'font-size':    '0.875em',
    'opacity':      '0.86666667'
};

const literalCodeCSS = {
    'box-sizing':   'border-box',
    'display':      'block',
    'font-family':  'inherit',
    /* Nothing special about this number */
    'font-size':    '0.93333em',
    'line-height':  '1.5em',
    'white-space':  'normal',
    'border-top':   'inherit',
    'border-bottom': 'inherit',
    'border-radius': '0',
    'padding':      '0.5em 0.375rem',
    'width':        'auto',
    'margin-left':  '-0.375rem',
    'margin-right': '-0.375rem',
    'color':        '#141B1E'
};

const literalCountCSS = {
    'box-sizing': 'border-box',
    'position':   'absolute',
    'top':        '0',
    'right':      '0.375rem'
};

export function printError(renderer, error) {
    // TODO: get the data in here!
    log('error', renderer.identifier + ' – ' + renderer.code, '', '', 'red');

    return create('pre', {
        children: [
            renderer.debug + ' ',

            create('small', {
                text:  renderer.code/*.replace(/</g, '&lt;').replace(/>/g, '&gt;')*/,
                style: literalSmallCSS
            }),

            create('code', {
                html: '<strong>' + error.constructor.name + '</strong> ' + error.message.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
                style: assign({ 'background-color': '#ffdddd' }, literalCodeCSS)
            }),

            create('a', {
                text: 'literal',
                href: 'https://stephen.band/literal/literal-html/',
                style: literalLinkCSS
            })
        ],

        style: assign({ 'color': 'white', 'background-color': '#DC0F0E' }, literalCSS)
    });
}

export function printDebug(renderer, error) {
    const fullpath = renderer.path
        + (typeof renderer.name === 'string' ? '>' + renderer.name : '') ;

    const children = [
        renderer.debug + ' ',

        create('small', {
            text:  (fullpath ? '> ' + fullpath.replace(/>/g, ' > ') : ''),
            style: literalSmallCSS
        }),

        create('span', {
            text: renderer.count,
            style: literalCountCSS
        })
    ];

    let n = 0;
    let object;
    while ((object = arguments[++n]) !== undefined) {
        children.push(create('code', {
            children: [
                create('strong', { text: object.constructor.name }),
                JSON.stringify(object)
            ],

            style: assign({ 'background-color': '#c5dded' }, literalCodeCSS)
        }));
    }

    children.push(create('a', {
        text: 'literal',
        href: 'https://stephen.band/literal/literal-html/',
        style: literalLinkCSS
    }));

    return create('pre', {
        children: children,
        style: assign({ 'color': 'white', 'background-color': '#46789a' }, literalCSS)
    });
}

export default function print(renderer, object) {
    return object instanceof Error ?
        printError(renderer, object) :
        printDebug(renderer, object) ;
}

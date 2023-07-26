
/**
Template expressions

Expressions are evaluated, and how they then render depends on their type.

Promises are rendered when they resolve; arrays are flattened and joined without
spaces or commas; streams are rendered whenever they emit a value.

Falsy values other than `false` and `0` don't render at all, so expressions
may evaluate to `undefined`, `null` or `NaN` and go unseen.

Literal flattens nested collections. A _stream_ of _arrays_ of _strings_ will
render text whenever the stream emits an array of strings.

<table class="striped-table x-bleed">
    <thead>
        <tr>
            <th style="width:20%;">Type</th>
            <th>Expression</th>
            <th style="width:30%;">Renders as</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>undefined</th>
            <th><code>${ undefined }</code></th>
            <td>
                <template is="literal-template">${ undefined }</template>
            </td>
        </tr>
        <tr>
            <th>null</th>
            <th><code>${ null }</code></th>
            <td>
                <template is="literal-template">${ null }</template>
            </td>
        </tr>
        <tr>
            <th>NaN</th>
            <th><code>${ NaN }</code></th>
            <td>
                <template is="literal-template">${ NaN }</template>
            </td>
        </tr>
        <tr>
            <th>String</th>
            <th><code>${ 'Hello' }</code></th>
            <td>
                <template is="literal-template">${ 'Hello' }</template>
            </td>
        </tr>
        <tr>
            <th>Boolean</th>
            <th><code>${ true }, ${ false }</code></th>
            <td>
                <template is="literal-template">${ true }, ${ false }</template>
            </td>
        </tr>
        <tr>
            <th>Number</th>
            <th><code>${ 123.4 }</code></th>
            <td>
                <template is="literal-template">${ 123.4 }</template>
            </td>
        </tr>
        <tr>
            <th>Infinity</th>
            <th><code>${ Infinity }, ${ -Infinity }</code></th>
            <td>
                <template is="literal-template">${ Infinity }, ${ -Infinity }</template>
            </td>
        </tr>
        <tr>
            <th>Function</th>
            <th><code>${ function name(param) {} }</code></th>
            <td>
                <template is="literal-template">${ function name(param) {} }</template>
            </td>
        </tr>
        <tr>
            <th>Arrow</th>
            <th><code>${ (param) => {} }</code></th>
            <td>
                <template is="literal-template">${ (param) => {} }</template>
            </td>
        </tr>
        <tr>
            <th>RegExp</th>
            <th><code>${ /^regexp/ }</code></th>
            <td>
                <template is="literal-template">${ /^regexp/ }</template>
            </td>
        </tr>
        <tr>
            <th>Symbol</th>
            <th><code>${ Symbol('name') }</code></th>
            <td>
                <template is="literal-template">${ Symbol('name') }</template>
            </td>
        </tr>
        <tr>
            <th>Array</th>
            <th><code>${ [0, 1, 2, 3] }</code></th>
            <td>
                <template is="literal-template">${ [0, 1, 2, 3] }</template>
            </td>
        </tr>
        <tr>
            <th>Object</th>
            <th><code>${ { property: 'value' } }</code></th>
            <td>
                <template is="literal-template">${ { property: 'value' } }</template>
            </td>
        </tr>
        <tr>
            <th>Node</th>
            <th><code>${ document.createTextNode('Hello') }</code></th>
            <td>
                <template is="literal-template">${ document.createTextNode('Hello') }</template>
            </td>
        </tr>
        <tr>
            <th>Promise</th>
            <th><code>${ Promise.resolve('yoohoo') }</code></th>
            <td>
                <template is="literal-template">${ Promise.resolve('yoohoo') }</template>
            </td>
        </tr>
        <tr>
            <th>Stream</th>
            <th><code>${ events('pointermove', body)<br/>
            &nbsp;&nbsp;.map((e) => round(e.pageX)) }</code></th>
            <td>
                <template is="literal-template">${ events('pointermove', body).map((e) => round(e.pageX)) }</template>
            </td>
        </tr>
    </tbody>
</table>
**/

import id       from '../../fn/modules/id.js';
import overload from '../../fn/modules/overload.js';
import toType   from '../../fn/modules/to-type.js';
//import { Observer } from '../../fn/observer/observer.js';

// Matches the arguments list in the result of fn.toString()
const rarrowents = /\s*(\([\w,\s]*\))/;
const rarguments = /function(?:\s+\w+)?\s*(\([\w,\s]*\))/;

const toText = overload(toType, {
    'boolean': id,

    // Print function and parameters
    'function': (value) => (
        value.prototype ?
            (value.name || 'function') + (rarguments.exec(value.toString()) || [])[1] :
            (rarrowents.exec(value.toString()) || [])[1] + ' ⇒ {…}'
    ),

    // Convert NaN to empty string and Infinity to ∞ symbol
    'number': (value) => (
        Number.isNaN(value) ? '' :
        Number.isFinite(value) ? value :
        value < 0 ? '-∞' : '∞'
    ),

    'string': id,

    'symbol': (value) => value.toString(),

    'undefined': (value) => '',

    'object': overload((object) => (object && object.constructor.name), {
        'Array':   (object) => object.map(toText).join(''),
        'RegExp':  (object) => '/' + object.source + '/',
        'Stream':  () => '',
        'null':    () => '',
        'default': (object) => JSON.stringify(object, null, 2)
    }),

    'default': JSON.stringify
});

export default toText;


import id       from '../../../fn/modules/id.js';
import overload from '../../../fn/modules/overload.js';
import toType   from '../../../fn/modules/to-type.js';

/**
Template expressions

Expressions may evaluate to a **string** or other **primitive**, a **DOM node**
or **fragment**, an **array** of values, another **renderer**, or even an
asynchronous value in a **promise** or a **stream**.

**Falsy** values other than `false` and `0` – `undefined`, `null` or `NaN` –  don't
render at all.

**Arrays** are flattened and joined (without spaces or commas).

**Promises** and **streams** are rendered asynchronously when they emit values.

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
                <template is="literal-html">${ undefined }</template>
            </td>
        </tr>
        <tr>
            <th>null</th>
            <th><code>${ null }</code></th>
            <td>
                <template is="literal-html">${ null }</template>
            </td>
        </tr>
        <tr>
            <th>NaN</th>
            <th><code>${ NaN }</code></th>
            <td>
                <template is="literal-html">${ NaN }</template>
            </td>
        </tr>
        <tr>
            <th>String</th>
            <th><code>${ 'Hello' }</code></th>
            <td>
                <template is="literal-html">${ 'Hello' }</template>
            </td>
        </tr>
        <tr>
            <th>Boolean</th>
            <th><code>${ true }, ${ false }</code></th>
            <td>
                <template is="literal-html">${ true }, ${ false }</template>
            </td>
        </tr>
        <tr>
            <th>Number</th>
            <th><code>${ 123.4 }</code></th>
            <td>
                <template is="literal-html">${ 123.4 }</template>
            </td>
        </tr>
        <tr>
            <th>Infinity</th>
            <th><code>${ Infinity }, ${ -Infinity }</code></th>
            <td>
                <template is="literal-html">${ Infinity }, ${ -Infinity }</template>
            </td>
        </tr>
        <tr>
            <th>Function</th>
            <th><code>${ function name(param) {} }</code></th>
            <td>
                <template is="literal-html">${ function name(param) {} }</template>
            </td>
        </tr>
        <tr>
            <th>Arrow</th>
            <th><code>${ (param) => {} }</code></th>
            <td>
                <template is="literal-html">${ (param) => {} }</template>
            </td>
        </tr>
        <tr>
            <th>RegExp</th>
            <th><code>${ /^regexp/ }</code></th>
            <td>
                <template is="literal-html">${ /^regexp/ }</template>
            </td>
        </tr>
        <tr>
            <th>Symbol</th>
            <th><code>${ Symbol('name') }</code></th>
            <td>
                <template is="literal-html">${ Symbol('name') }</template>
            </td>
        </tr>
        <tr>
            <th>Array</th>
            <th><code>${ [0, 1, 2, 3] }</code></th>
            <td>
                <template is="literal-html">${ [0, 1, 2, 3] }</template>
            </td>
        </tr>
        <tr>
            <th>Object</th>
            <th><code>${ { property: 'value' } }</code></th>
            <td>
                <template is="literal-html">${ { property: 'value' } }</template>
            </td>
        </tr>
        <tr>
            <th>Node</th>
            <th><code>${ document.createTextNode('Hello') }</code></th>
            <td>
                <template is="literal-html">${ document.createTextNode('Hello') }</template>
            </td>
        </tr>
        <tr>
            <th>Promise</th>
            <th><code>${ Promise.resolve('yoohoo') }</code></th>
            <td>
                <template is="literal-html">${ Promise.resolve('yoohoo') }</template>
            </td>
        </tr>
        <tr>
            <th>Stream</th>
            <th><code>${ events('pointermove', body)<br/>
            &nbsp;&nbsp;.map((e) => round(e.pageX)) }</code></th>
            <td>
                <template is="literal-html">${ events('pointermove', body).map((e) => round(e.pageX)) }</template>
            </td>
        </tr>
    </tbody>
</table>
**/


// Matches the arguments list in the result of fn.toString()
const rarrowents = /\s*(\([\w,\s]*\))/;
const rarguments = /function(?:\s+\w+)?\s*(\([\w,\s]*\))/;

const toText = overload(toType, {
    'boolean': id,

    'function': (value) => (
        // Print function name and parameters
        value.prototype ?
            (value.name || 'function') + (rarguments.exec(value.toString()) || [])[1] :
            (rarrowents.exec(value.toString()) || [])[1] + ' ⇒ {…}'
    ),

    'number': (value) => (
        // Convert NaN to empty string and Infinity to ∞ symbol
        Number.isNaN(value) ? '' :
        Number.isFinite(value) ? value + '' :
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

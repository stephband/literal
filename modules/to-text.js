
/**
Template tags

Literal template tags can contain any valid JavaScript expression. The renderer
decides how to render the evaluated output of each tag based on its type and
constructor. Where an expression evaluates to a promise, the promise resolves
before being rendered.

<table class="striped-table x-bleed">
    <thead>
        <tr>
            <th style="width:20%;">Type</th>
            <th>Expression</th>
            <th style="width:30%;">Rendered as</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>undefined</th>
            <th><code>${ undefined }</code></th>
            <td>
                <template id="value-undefined">${ undefined }</template>
                <template-include src="#value-undefined"></template-include>
            </td>
        </tr>
        <tr>
            <th>null</th>
            <th><code>${ null }</code></th>
            <td>
                <template id="value-null">${ null }</template>
                <template-include src="#value-null"></template-include>
            </td>
        </tr>
        <tr>
            <th>NaN</th>
            <th><code>${ NaN }</code></th>
            <td>
                <template id="value-nan">${ NaN }</template>
                <template-include src="#value-nan"></template-include>
            </td>
        </tr>
        <tr>
            <th>String</th>
            <th><code>${ 'Hello' }</code></th>
            <td>
                <template id="value-string">${ 'Hello' }</template>
                <template-include src="#value-string"></template-include>
            </td>
        </tr>
        <tr>
            <th>Number</th>
            <th><code>${ 100.3 }</code></th>
            <td>
                <template id="value-number">${ 100.3 }</template>
                <template-include src="#value-number"></template-include>
            </td>
        </tr>
        <tr>
            <th>Infinity</th>
            <th><code>${ Infinity }, ${ -Infinity }</code></th>
            <td>
                <template id="value-infinity">${ Infinity }, ${ -Infinity }</template>
                <template-include src="#value-infinity"></template-include>
            </td>
        </tr>
        <tr>
            <th>Function</th>
            <th><code>${ function name(param) {} }</code></th>
            <td>
                <template id="value-function">${ function name(param) {} }</template>
                <template-include src="#value-function"></template-include>
            </td>
        </tr>
        <tr>
            <th>Arrow</th>
            <th><code>${ (param) => {} }</code></th>
            <td>
                <template id="value-arrow">${ (param) => {} }</template>
                <template-include src="#value-arrow"></template-include>
            </td>
        </tr>
        <tr>
            <th>RegExp</th>
            <th><code>${ /^regexp/ }</code></th>
            <td>
                <template id="value-regexp">${ /^regexp/ }</template>
                <template-include src="#value-regexp"></template-include>
            </td>
        </tr>
        <tr>
            <th>Symbol</th>
            <th><code>${ Symbol('name') }</code></th>
            <td>
                <template id="value-symbol">${ Symbol('name') }</template>
                <template-include src="#value-symbol"></template-include>
            </td>
        </tr>
        <tr>
            <th>Array</th>
            <th><code>${ [0, 1, 2, 3] }</code></th>
            <td>
                <template id="value-array">${ [0, 1, 2, 3] }</template>
                <template-include src="#value-array"></template-include>
            </td>
        </tr>
        <tr>
            <th>Object</th>
            <th><code>${ { property: 'value' } }</code></th>
            <td>
                <template id="value-object">${ { property: 'value' } }</template>
                <template-include src="#value-object"></template-include>
            </td>
        </tr>
        <tr>
            <th>Node</th>
            <th><code>${ document.createTextNode('Text') }</code></th>
            <td>
                <template id="value-node">${ document.createTextNode('Text') }</template>
                <template-include src="#value-node"></template-include>
            </td>
        </tr>
    </tbody>
</table>
**/

import id       from '../../fn/modules/id.js';
import overload from '../../fn/modules/overload.js';
import toType   from '../../fn/modules/to-type.js';
import { Observer } from '../../fn/observer/observer.js';

// Matches the arguments list in the result of fn.toString()
const rarrowents = /\s*(\([\w,\s]*\))/;
const rarguments = /function(?:\s+\w+)?\s*(\([\w,\s]*\))/;

const toText = overload(toType, {
    /**

    **/
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

        // We do want keys of observer to be read so that changes will cause
        // updates. TODO: it may be better not to getTarget these things
        // before sending to toText() ? I mean, ${ DATA } wont be static like
        // this !
        'default': (object) => JSON.stringify(Observer(object), null, 2)
    }),

    'default': JSON.stringify
});

export default toText;

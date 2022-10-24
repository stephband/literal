
import get               from '../../fn/modules/get.js';
import overload          from '../../fn/modules/overload.js';

import AttributeRenderer from './renderer-attribute.js';
import BooleanRenderer   from './renderer-boolean.js';
import CheckedRenderer   from './renderer-checked.js';
import TokensRenderer    from './renderer-tokens.js';
import ValueRenderer     from './renderer-value.js';
import DOMRenderer       from './renderer-dom.js';
import isLiteral         from './is-literal.js';
import decode            from './decode.js';
import truncate          from './truncate.js';


/**
compileAttributes(renderers, attribute, template, path, consts, debug)
**/

const compileBoolean = (attribute, template, path, source, parameters, consts, debug) =>
    new BooleanRenderer(source, consts, template, path, attribute.ownerElement, attribute.localName, debug, parameters);

const compileAttributeByName = overload(get('localName'), {
    async:          compileBoolean,
    autofocus:      compileBoolean,
    autoplay:       compileBoolean,
    controls:       compileBoolean,
    defer:          compileBoolean,
    disabled:       compileBoolean,
    formnovalidate: compileBoolean,
    hidden:         compileBoolean,
    ismap:          compileBoolean,
    itemscope:      compileBoolean,
    loop:           compileBoolean,
    multiple:       compileBoolean,
    muted:          compileBoolean,
    nomodule:       compileBoolean,
    novalidate:     compileBoolean,
    open:           compileBoolean,
    readonly:       compileBoolean,
    required:       compileBoolean,
    reversed:       compileBoolean,
    selected:       compileBoolean,
    // Default is a boolean attribute, but we cant use the key 'default' here
    //default:        compileBoolean,

    checked: (attribute, template, path, source, parameters, consts, debug) =>
        new CheckedRenderer(source, consts, template, path, attribute.ownerElement, null, debug, parameters),

    class: (attribute, template, path, source, parameters, consts, debug) =>
        new TokensRenderer(source, consts, template, path, attribute.ownerElement, 'class', debug, parameters),

    datetime: function compileDatetime(attribute, template, path, source, parameters, consts, debug) {
        if (window.DEBUG) { console.log('Todo: compile datetime attribute'); }
    },

    // Special workaround attribute used in cases where ${} cannot be added
    // directly to the HTML content, such as in <tbody> or <tr>
    'inner-content': (attribute, template, path, source, parameters, consts, debug) => {
        const node = attribute.ownerElement;
        node.removeAttribute(attribute.localName);
        // source, consts, template, path, node, name, element
        return new DOMRenderer(decode(source), consts, template, path, node, 'innerHTML', debug, parameters);
    },

    value: (attribute, template, path, source, parameters, consts, debug) =>
        // source, consts, template, path, node, name, message, parameters
        new ValueRenderer(source, consts, template, path, attribute.ownerElement, null, debug, parameters),

    default: (attribute, template, path, source, parameters, consts, debug) =>
        // source, consts, template, path, node, name, message, parameters
        new AttributeRenderer(source, consts, template, path, attribute.ownerElement, attribute.localName, debug, parameters)
});

export default function compileAttribute(renderers, attribute, template, path, parameters, consts) {
    const source = attribute.value;
    if (!isLiteral(source)) { return; }

    const debug = window.DEBUG && ''
        + '<'
        + attribute.ownerElement.tagName.toLowerCase() + ' '
        + attribute.localName + '="' + truncate(32, source)
        + '">';

    renderers.push(compileAttributeByName(attribute, template, path, source, parameters, consts, debug));
}

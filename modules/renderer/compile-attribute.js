
import get               from '../../../fn/modules/get.js';
import overload          from '../../../fn/modules/overload.js';
import decode            from '../../../dom/modules/decode.js';
import isLiteral         from '../is-literal.js';
import AttributeRenderer from './renderer-attribute.js';
import BooleanRenderer   from './renderer-boolean.js';
import CheckedRenderer   from './renderer-checked.js';
import TokensRenderer    from './renderer-tokens.js';
import ValueRenderer     from './renderer-value.js';
import TextRenderer      from './renderer-text.js';
import truncate          from './truncate.js';


/**
compileAttributes(renderers, attribute, path, debug)
**/

const compileBoolean = (attribute, path, source, parameters, message) =>
    new BooleanRenderer(source, attribute.ownerElement, path, attribute.localName, parameters, message);

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
    // TODO: Default is a boolean attribute, but we cant use the key 'default'
    // here because of overload() signature. Uh-oh.
    //default:        compileBoolean,

    checked: (attribute, path, source, parameters, message) =>
        new CheckedRenderer(source, attribute.ownerElement, path, 'checked', parameters, message),

    class: (attribute, path, source, parameters, message) =>
        new TokensRenderer(source, attribute.ownerElement, path, 'class', parameters, message),

    datetime: function compileDatetime(attribute, path, source, parameters, debug) {
        if (window.DEBUG) { console.log('Todo: compile datetime attribute'); }
    },

    // Workaround attribute used in cases where ${} cannot be added directly to
    // HTML, such as in <tbody> or <tr>
    'inner-html': (attribute, path, source, parameters, message) => {
        const node = attribute.ownerElement;
        node.removeAttribute(attribute.localName);
        return new TextRenderer(decode(source), node, path, parameters, message);
    },

    // Todo: remove deprecation error...
    'inner-content': () => {
        throw new Error('Attribute inner-content renamed as inner-html');
    },

    value: (attribute, path, source, parameters, message) =>
        new ValueRenderer(source, attribute.ownerElement, path, 'value', parameters, message),

    default: (attribute, path, source, parameters, message) =>
        new AttributeRenderer(source, attribute.ownerElement, path, attribute.localName, parameters, message)
});

export default function compileAttribute(renderers, attribute, path, parameters, message = '') {
    const source = attribute.value;
    if (!isLiteral(source)) { return; }

    if (window.DEBUG) {
        message += '<'
            + attribute.ownerElement.tagName.toLowerCase() + ' '
            + attribute.localName + '="' + truncate(32, source)
            + '">' ;
    }

    renderers.push(compileAttributeByName(attribute, path, source, parameters, message));
}

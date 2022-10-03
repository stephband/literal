
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
compileAttributes(renderers, attribute, path, consts)
**/

const compileBoolean = (attribute, path, source, consts, message) =>
    new BooleanRenderer(source, consts, path, attribute.ownerElement, attribute.localName, message);

const compileAttributeByName = overload(get('localName'), {
    'disabled': compileBoolean,
    'hidden':   compileBoolean,
    'required': compileBoolean,

    'checked': (attribute, path, source, consts, message) =>
        new CheckedRenderer(source, consts, path, attribute.ownerElement, 'checked', message),

    'class': (attribute, path, source, consts, message) =>
        new TokensRenderer(source, consts, path, attribute.ownerElement, 'class', message),

    'datetime': function compileDatetime(attribute, path, source, consts, message) {
        if (window.DEBUG) { console.log('Todo: compile datetime attribute'); }
    },

    // Special workaround attribute used in cases where ${} cannot be added
    // directly to the HTML content, such as in <tbody> or <tr>
    'inner-content': (attribute, path, source, consts, message) => {
        const node = attribute.ownerElement;
        node.removeAttribute(attribute.localName);
        return new DOMRenderer(decode(source), consts, path, node, 'innerHTML', message);
    },

    'value': (attribute, path, source, consts, message) =>
        new ValueRenderer(source, consts, path, attribute.ownerElement, 'value', message),

    'default': (attribute, path, source, consts, message) =>
        new AttributeRenderer(source, consts, path, attribute.ownerElement, attribute.localName, message)
});

export default function compileAttribute(renderers, attribute, path, consts, message) {
    const source = attribute.value;
    if (!isLiteral(source)) { return; }
    renderers.push(compileAttributeByName(attribute, path, source, consts, message + ' ' + attribute.localName + '="' + truncate(32, source) + '">'));
}

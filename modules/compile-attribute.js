
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


/**
compileAttributes(renderers, attribute, path, consts)
**/

const compileBoolean = (attribute, path, source, consts) =>
    new BooleanRenderer(source, consts, path, attribute.ownerElement, attribute.localName);

const compileAttributeByName = overload(get('localName'), {
    'checked': (attribute, path, source, consts) =>
        new CheckedRenderer(source, consts, path, attribute.ownerElement),

    'class': (attribute, path, source, consts) =>
        new TokensRenderer(source, consts, path, attribute.ownerElement, 'class'),

    'datetime': function compileDatetime(attribute, path, source, consts) {
        if (window.DEBUG) { console.log('Todo: compile datetime attribute'); }
    },

    'disabled': compileBoolean,
    'hidden':   compileBoolean,

    // Special workaround attribute used in cases where ${} cannot be added
    // directly to the HTML content, such as in <tbody> or <tr>
    'inner-content': (attribute, path, source, consts) => {
        const node = attribute.ownerElement;
        node.removeAttribute(attribute.localName);
        return new DOMRenderer(decode(source), consts, path, node, 'innerHTML');
    },

    'required': compileBoolean,

    'value': (attribute, path, source, consts) =>
        new ValueRenderer(source, consts, path, attribute.ownerElement),

    'default': (attribute, path, source, consts) =>
        new AttributeRenderer(source, consts, path, attribute.ownerElement, attribute.localName)
});

export default function compileAttribute(renderers, attribute, path, consts) {
    const source = attribute.value;
    if (!isLiteral(source)) { return; }
    renderers.push(compileAttributeByName(attribute, path, source, consts));
}

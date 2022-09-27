
import noop     from '../../fn/modules/noop.js';
import overload from '../../fn/modules/overload.js';
import toType   from '../../dom/modules/to-type.js';

import AttributeRenderer from './renderer-attribute.js';
import BooleanRenderer   from './renderer-boolean.js';
import CheckedRenderer   from './renderer-checked.js';
import TokensRenderer    from './renderer-tokens.js';
import ValueRenderer     from './renderer-value.js';
import DOMRenderer       from './renderer-dom.js';
import decode            from './decode.js';

const A = Array.prototype;
const rliteral = /\$\{/;


/**
compileAttributes(renderers, options, nodeames)
**/

function compileBoolean(renderers, options, node, attribute) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    renderers.push(new BooleanRenderer(source, node, attribute.localName));
}

function compileTokens(renderers, options, node, attribute) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    renderers.push(new TokensRenderer(source, node, attribute.localName));
}

const compileAttribute = overload((renderers, options, node, attribute) => attribute.localName, {
    'checked': (renderers, options, node, attribute) => {
        const source = attribute.value;
        if (!source || !rliteral.test(source)) { return; }
        renderers.push(new CheckedRenderer(source, node, 'checked'));
    },

    'class': compileTokens,

    'datetime': function compileDatetime(renderers, options, node, attribute) {
        if (window.DEBUG) { console.log('Todo: compile datetime attribute'); }
    },

    'disabled': compileBoolean,
    'hidden': compileBoolean,

    // Special workaround attribute used in cases where ${} cannot be added
    // directly to the HTML content, such as in <tbody> or <tr>
    'inner-content': function(renderers, options, node, attribute) {
        const source = attribute.value;
        if (!source || !rliteral.test(source)) { return; }
//        node.removeAttribute(attribute.localName);
//        options.source = decode(source);
//        options.name   = 'innerHTML';
//        renderers.push(new DOMRenderer(node, options, parent));
    },

    'required': compileBoolean,

    'value': (renderers, options, node, attribute) => {
        const source = attribute.value;
        if (!source || !rliteral.test(source)) { return; }
        renderers.push(new ValueRenderer(source, node, 'value'));
    },

    'default': (renderers, options, node, attribute) => {
        const source = attribute.value;
        if (!source || !rliteral.test(source)) { return; }
        renderers.push(new AttributeRenderer(source, node, attribute.localName));
    }
});

function compileAttributes(renderers, options, node) {
    // Attributes may be removed during parsing so copy the list before looping
    const attributes = A.slice.apply(node.attributes);
    var n = -1, attribute;
    // Todo: order attributes so that min, max, value come last?
    while (attribute = attributes[++n]) {
        compileAttribute(renderers, options, node, attribute);
    }
}


/**
compileElement()
**/

function compileChildren(renderers, options, node, parent) {
    const children = node.childNodes;

    if (children) {
        const path = options.path;
        let n = -1;

        while(children[++n]) {
            options.path = path ? path + '.' + n : '' + n;
            compileNode(renderers, options, children[n], parent);
        }

        // Put path back to what it was or subsequent renderers will get an
        // erroneous path
        options.path = path;
    }

    return renderers;
}

const compileElement = overload((renderers, options, element) => element.tagName.toLowerCase(), {
    // Ignore SVG <defs>, which for our purposes we consider as inert like
    // an HTML <template>
    'defs': noop,

    'default': (renderers, options, element) => {
        // Children first means inner DOM to outer DOM
        compileChildren(renderers, options, element, element);
        compileAttributes(renderers, options, element);
        return renderers;
    }
});


/**
compileNode()
**/

const compileNode = overload((renderers, options, node) => toType(node), {
    'comment': noop,

    'element': compileElement,

    'fragment': compileChildren,

    'text': (renderers, options, node, element) => {
        const string = node.nodeValue;

        if (string && rliteral.test(string)) {
            const source = decode(string);
            renderers.push(new DOMRenderer(source, node, null, element));
        }

        return renderers;
    },

    'doctype': noop,

    'document': (renderers, options, document) => {
        compileElement(renderers, options, document.documentElement);
        return renderers;
    },

    'default': () => {
        throw new Error('Node not compileable');
    }
});

export default compileNode;

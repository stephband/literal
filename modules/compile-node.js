
import noop             from '../../fn/modules/noop.js';
import overload         from '../../fn/modules/overload.js';
import toType           from '../../dom/modules/to-type.js';

import compileAttribute from './compile-attribute.js';
import DOMRenderer      from './renderer-dom.js';
import isLiteral        from './is-literal.js';
import decode           from './decode.js';


/**
compileElement()
**/

function compileChildren(renderers, node, path, consts, template, element) {
    const children = node.childNodes;

    if (children) {
        let n = -1;

        while(children[++n]) {
            compileNode(renderers, children[n], path ? path + '.' + n : '' + n, consts, template, element);
        }
    }

    return renderers;
}

function compileAttributes(renderers, node, path, consts, template) {
    // Attributes may be removed during parsing so copy the list before looping
    const attributes = Array.from(node.attributes);
    var n = -1, attribute;
    // Todo: order attributes so that min, max, value come last?
    while (attribute = attributes[++n]) {
        compileAttribute(renderers, attribute, path, consts, template);
    }
}

const compileElement = overload((renderers, node) => node.tagName.toLowerCase(), {
    // Ignore SVG <defs>, which for our purposes we consider as inert like
    // an HTML <template>
    'defs': noop,

    'default': (renderers, node, path, consts, template) => {
        // Children first means inner DOM to outer DOM
        compileChildren(renderers, node, path, consts, template, node);
        compileAttributes(renderers, node, path, consts, template);
        return renderers;
    }
});


/**
compileNode()
**/

const compileNode = overload((renderers, node) => toType(node), {
    'comment': noop,

    'element': compileElement,

    'fragment': compileChildren,

    'text': (renderers, node, path, consts, template, element) => {
        const string = node.nodeValue;

        if (isLiteral(string)) {
            const source = decode(string);
            renderers.push(new DOMRenderer(source, consts, path, node, null, template, element));
        }

        return renderers;
    },

    'doctype': noop,

    'document': (renderers, document, path, consts, template) => {
        compileElement(renderers, document.documentElement, path, consts, template);
        return renderers;
    },

    'default': () => {
        throw new Error('Node not compileable');
    }
});

export default compileNode;

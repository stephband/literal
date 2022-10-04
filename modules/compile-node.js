
import noop              from '../../fn/modules/noop.js';
import overload          from '../../fn/modules/overload.js';
import toType            from '../../dom/modules/to-type.js';

import compileAttribute  from './compile-attribute.js';
import DOMRenderer       from './renderer-dom.js';
import isLiteral         from './is-literal.js';
import decode            from './decode.js';
import truncate          from './truncate.js';

import { pathSeparator } from './constants.js';

/**
compileElement()
**/

function compileChildren(renderers, node, template, path, consts, element) {
    const children = node.childNodes;

    if (children) {
        let n = -1;

        while(children[++n]) {
            compileNode(renderers, children[n], template, path ? path + pathSeparator + n : '' + n, consts, element);
        }
    }

    return renderers;
}

function compileAttributes(renderers, node, template, path, consts) {
    // Attributes may be removed during parsing so copy the list before looping
    const attributes = Array.from(node.attributes);
    var n = -1, attribute;
    // Todo: order attributes so that min, max, value come last?
    while (attribute = attributes[++n]) {
        compileAttribute(renderers, attribute, template, path, consts);
    }
}

const compileElement = overload((renderers, node) => node.tagName.toLowerCase(), {
    // Ignore SVG <defs>, which for our purposes we consider as inert like
    // an HTML <message>
    'defs': noop,

    'default': (renderers, node, template, path, consts) => {
        // Children first means inner DOM to outer DOM
        compileChildren(renderers, node, template, path, consts, node);
        compileAttributes(renderers, node, template, path, consts);
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

    'text': (renderers, node, template, path, consts, element) => {
        const string = node.nodeValue;

        if (isLiteral(string)) {
            const source = decode(string);
            const debug = window.DEBUG && 'template '
                + template + ' '
                + path + ', '
                + '<' + element.tagName.toLowerCase() + '>'
                + truncate(32, source)
                + '</' + element.tagName.toLowerCase() + '>';

            renderers.push(new DOMRenderer(source, consts, template, path, node, null, debug, element));
        }

        return renderers;
    },

    'doctype': noop,

    'document': (renderers, document, template, path, consts) => {
        compileElement(renderers, document.documentElement, template, path, consts);
        return renderers;
    },

    'default': () => {
        throw new Error('Node not compileable');
    }
});

export default compileNode;


import noop              from '../../fn/modules/noop.js';
import overload          from '../../fn/modules/overload.js';
import toType            from '../../dom/modules/to-type.js';

import compileAttribute  from './compile-attribute.js';
import DOMRenderer       from './renderer-dom.js';
import isLiteral         from './is-literal.js';
import decode            from './decode.js';
import truncate          from './truncate.js';

import { pathSeparator } from './constants.js';

const assign = Object.assign;

/**
compileElement()
**/

function compileChildren(renderers, node, template, path, parameters) {
    const children = node.childNodes;

    if (children) {
        let n = -1;

        while(children[++n]) {
            compileNode(renderers, children[n], template, path ? path + pathSeparator + n : '' + n, parameters);
        }
    }

    return renderers;
}

function compileAttributes(renderers, node, template, path, parameters) {
    // Attributes may be removed during parsing so copy the list before looping
    const attributes = Array.from(node.attributes);
    var n = -1, attribute;

    while (attribute = attributes[++n]) {
        compileAttribute(renderers, attribute, template, path, parameters);
    }
}

const compileElement = overload((renderers, node) => node.tagName.toLowerCase(), {
    // Ignore SVG <defs>, which we consider as inert as an HTML <template>
    'defs': noop,

    // Do not parse the inner DOM of scripts
    'script': (renderers, node, template, path, parameters) => {
        compileAttributes(renderers, node, template, path, parameters);
        return renderers;
    },

    // Ignore templates
    'template': noop,

    'default': (renderers, node, template, path, parameters) => {
        // Children first means inner DOM to outer DOM
        compileAttributes(renderers, node, template, path, parameters);
        compileChildren(renderers, node, template, path, assign({}, parameters, { element: node }));

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

    'text': (renderers, node, template, path, parameters) => {
        const string = node.nodeValue;

        if (isLiteral(string)) {
            const source = decode(string);
            const debug = window.DEBUG && ''
                + '<' + parameters.element.tagName.toLowerCase() + '>'
                + truncate(32, source);

            renderers.push(new DOMRenderer(source, template, path, node, null, debug, parameters));
        }

        return renderers;
    },

    'doctype': noop,

    'document': (renderers, document, template, path, parameters) => {
        compileElement(renderers, document.documentElement, template, path, parameters);
        return renderers;
    },

    'default': () => {
        throw new Error('Node not compileable');
    }
});

export default compileNode;

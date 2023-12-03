
import id                from '../../../fn/modules/id.js';
import overload          from '../../../fn/modules/overload.js';
import toType            from '../../../dom/modules/to-type.js';
import decode            from '../../../dom/modules/decode.js';
import isLiteralString   from '../is-literal-string.js';
import { pathSeparator } from './constants.js';
import truncate          from './truncate.js';
import compileAttribute  from './compile-attribute.js';
import TextRenderer      from './renderer-text.js';


const assign = Object.assign;


/*
compileChildren(renderers, node, path, parameters, message)
*/

function compileChildren(renderers, node, path, parameters, message = '') {
    const children = node.childNodes;

    if (children) {
        let n = -1;
        while(children[++n]) {
            compileNode(renderers, children[n], path ? path + pathSeparator + n : '' + n, parameters, message);
        }
    }

    return renderers;
}


/*
compileAttributes(renderers, node, path, parameters, message)
*/

function compileAttributes(renderers, node, path, parameters, message = '') {
    // Attributes may be removed during parsing so copy the list before looping
    const attributes = Array.from(node.attributes);
    let n = -1, attribute;

    while (attribute = attributes[++n]) {
        compileAttribute(renderers, attribute, path + pathSeparator + attribute.localName, parameters, message);
    }

    return renderers;
}


/*
compileElement(renderers, node, path, parameters, message)
*/

const compileElement = overload((renderers, node) => node.tagName.toLowerCase(), {
    // Ignore SVG <defs>, which we consider as inert as an HTML <template>
    'defs': id,

    // Do not parse the inner DOM of scripts
    'script': (renderers, node, path, parameters, message) =>
        compileAttributes(renderers, node, path, parameters, message),

    // Ignore templates
    'template': id,

    'default': (renderers, node, path, parameters, message) => {
        // Children first means inner DOM to outer DOM
        compileAttributes(renderers, node, path, parameters, message);
        compileChildren(renderers, node, path, assign({}, parameters, { element: node }), message);
        return renderers;
    }
});


/**
compileNode(renderers, node, path, parameters, message)
**/

const compileNode = overload((renderers, node) => toType(node), {
    'comment':  id,
    'element':  compileElement,
    'fragment': compileChildren,

    'text': (renderers, node, path, parameters, message = '') => {
        const string = node.nodeValue;
        if (!isLiteralString(string)) {
            return renderers;
        }

        const source = decode(string);
        if (window.DEBUG) {
            message += '<'
                + parameters.element.tagName.toLowerCase()
                + '>'
                + truncate(72, source) ;
        }

        renderers.push(new TextRenderer(source, node, path, parameters, message));
        return renderers;
    },

    'doctype': id,

    'document': (renderers, document, path, parameters, message = '') =>
        compileElement(renderers, document.documentElement, path, parameters, message),

    'default': () => {
        throw new Error('Node not compileable');
    }
});

export default compileNode;

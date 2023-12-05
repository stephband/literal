
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
            // Templates are treated as pass-through to their `.content`, ie, they
            // don't count as nested elements in the render tree. This is to
            // facilitate render content in contexts such as in `<tbody>` or `<tr>`
            // where you cannot author text nodes directly. Wrap html in a
            // `<template>`, which is allowed in any context, and this sees through
            // them.
            //
            // TODO I don't understand why this works. The template is only
            // removed from this instance, subsequent instances have it so their
            // paths must be wrong, yet it appears to behave. Test.
            //
            // We may want this functionality to be opt-in with some kind of
            // attribute on the template or something. This problem first
            // encountered on blondel.ch.
            if (children[n].content) {
                const template = children[n];
                template.before(template.content);
                template.remove();
            }

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

    // Ignore templates. They have already been flattened into content anyway.
    'template': id,

    // Compiling children first means inner DOM to outer DOM, which allows
    // `<select>`, for example, to pick up the correct option value. If we
    // decide to change this order we should still make sure value attribute
    // is rendered after children for this reason.
    'default': (renderers, node, path, parameters, message) => {
        const params = assign({}, parameters, { element: node });
        compileChildren(renderers, node, path, params, message);
        compileAttributes(renderers, node, path, params, message);
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
            message = truncate(64, '<'
                + parameters.element.tagName.toLowerCase() + '>'
                + source.trim()
                + '</' + parameters.element.tagName.toLowerCase() + '>')
                + ' (' + message + ')' ;
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

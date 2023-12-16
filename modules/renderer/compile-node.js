
import id                from '../../../fn/modules/id.js';
import overload          from '../../../fn/modules/overload.js';
import toType            from '../../../dom/modules/to-type.js';
import decode            from '../../../dom/modules/decode.js';
import isLiteralString   from '../is-literal-string.js';
import { pathSeparator } from './constants.js';
import indexOf           from './index-of.js';
import truncate          from './truncate.js';
import compileAttribute  from './compile-attribute.js';
import TextRenderer      from './renderer-text.js';


const assign = Object.assign;


/*
compileChildren(renderers, element, path, message)
*/

function compileChildren(renderers, element, path, message = '') {
    // Children may mutate during compile, and we only want to compile
    // current children
    const children = Array.from(element.childNodes);

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
            // TODO We may want this functionality to be opt-in with some kind of
            // attribute on the template or something. This problem first
            // encountered on blondel.ch.
            if (children[n].content) {
                const template = children[n];
                template.before(template.content);
                template.remove();
            }

            compileNode(renderers, children[n], path, message);
        }
    }

    return renderers;
}


/*
compileAttributes(renderers, node, path, message)
*/

function compileAttributes(renderers, element, path, message = '') {
    // Attributes may be removed during parsing so copy the list before looping
    const attributes = Array.from(element.attributes);
    let n = -1, attribute;

    while (attribute = attributes[++n]) {
        compileAttribute(renderers, element, attribute, path, message);
    }

    return renderers;
}


/*
compileElement(renderers, node, path, message)
*/

const compileElement = overload((renderers, element) => element.tagName.toLowerCase(), {
    // Ignore <defs> and <template>, which we consider as inert. Templates
    // should have already been flattened into content anyway in compileChildren()
    'defs':     id,
    'template': id,

    // Do not parse the inner DOM of scripts
    'script':   compileAttributes,

    'textarea': (renderers, element, path, message) => {
        // A textarea does not have children but its textContent becomes its value
        compileAttributes(renderers, element, path, message);
        compileAttribute(renderers, element, {
            localName: 'value',
            value:     element.textContent
        }, path, message);
        element.textContent = '';
        return renderers;
    },

    'default': (renderers, element, path, message) => {
        // Compiling children first means inner DOM to outer DOM, which allows
        // `<select>`, for example, to pick up the correct option value. If we
        // decide to change this order we should still make sure value attribute
        // is rendered after children for this reason.
        compileChildren(renderers, element, path, message);
        compileAttributes(renderers, element, path, message);
        return renderers;
    }
});


/**
compileNode(renderers, node, path, message)
**/

const compileNode = overload((renderers, node) => toType(node), {
    'comment':  id,
    'doctype':  id,
    'document': compileChildren,
    'fragment': compileChildren,

    'element': (renderers, element, path, message = '') => {
        compileElement(renderers, element, (path ? path + pathSeparator : '') + indexOf(element), message = '');
        return renderers;
    },

    'text': (renderers, node, path, message = '') => {
        const string = node.nodeValue;
        if (!isLiteralString(string)) {
            return renderers;
        }

        const source = decode(string);
        if (window.DEBUG) {
            parent = node.parentElement || { tagName: 'template' };
            message = truncate(64, '<'
                + parent.tagName.toLowerCase() + '>'
                + source.trim()
                + '</' + parent.tagName.toLowerCase() + '>')
                + ' (' + message + ')' ;
        }

        renderers.push(new TextRenderer(source, node, path, indexOf(node), message));
        return renderers;
    },

    'default': () => {
        throw new Error('Literal: Cannot compile node');
    }
});

export default compileNode;

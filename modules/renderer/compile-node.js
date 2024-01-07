
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
            // In HTML it is not possible to write expressions directly in
            // certain contexts, such as in `<tbody>` or `<tr>`. They are parsed
            // out by the HTML parser before they become DOM. However, it *is*
            // acceptable to write `<template>` tags in these contexts. So here
            // we treat `<template>` as a pass-through to it's own `.content` –
            // ie, the `<template>` is removed from compiled content and
            // replaced with its own content.
            //
            // TODO We may want this functionality to be opt-in with some kind of
            // attribute on the template or something.
            if (children[n].content) {
                const template = children[n];
                const fragment = template.content;

                // Only do this if the fragment has content (otherwise childNode
                // index will be 1 short)
                if (fragment.childNodes.length) {
                    // Splice out the template, splice in the child nodes
                    children.splice(n, 1, ...fragment.childNodes);
                    // Do the same to the DOM
                    template.before(fragment);
                    template.remove();
                }
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
        // A <textarea> does not have children, its textContent becomes its value
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

        renderers.push(new TextRenderer(path, indexOf(node), source, message, node));
        return renderers;
    },

    'default': () => {
        throw new Error('Literal: Cannot compile node');
    }
});

export default compileNode;

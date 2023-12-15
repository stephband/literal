
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
compileChildren(renderers, context, element, path, parameters, message)
*/

function compileChildren(renderers, context, element, path, parameters, message = '') {
    const children = element.childNodes;

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

            compileNode(renderers, context, children[n], path ? path + pathSeparator + n : '' + n, parameters, message);
        }
    }

    return renderers;
}


/*
compileAttributes(renderers, node, path, parameters, message)
*/

function compileAttributes(renderers, element, path, parameters, message = '') {
    // Attributes may be removed during parsing so copy the list before looping
    const attributes = Array.from(element.attributes);
    let n = -1, attribute;

    while (attribute = attributes[++n]) {
        compileAttribute(renderers, element, attribute, path + pathSeparator + attribute.localName, parameters, message);
    }

    return renderers;
}


/*
compileElement(renderers, node, path, parameters, message)
*/

const compileElement = overload((renderers, element) => element.tagName.toLowerCase(), {
    // Ignore <defs> and <template>, which we consider as inert. Templates
    // should have already been flattened into content anyway, in
    // compileChildren()
    'defs':     id,
    'template': id,

    // Do not parse the inner DOM of scripts
    'script':   compileAttributes,

    'textarea': (renderers, element, path, parameters, message) => {
        // A textarea does not have children but its textContent becomes its value
        compileAttributes(renderers, element, path, parameters, message);
        compileAttribute(renderers, element, {
            localName:    'value',
            value:        element.textContent
        }, path + pathSeparator + 'value', parameters, message);
        element.textContent = '';
        return renderers;
    },

    'default': (renderers, element, path, parameters, message) => {
        // Compiling children first means inner DOM to outer DOM, which allows
        // `<select>`, for example, to pick up the correct option value. If we
        // decide to change this order we should still make sure value attribute
        // is rendered after children for this reason.
        //
        // Context is the element itself in this case as we know element is
        // not a fragment.
        compileChildren(renderers, element, element, path, parameters, message);
        compileAttributes(renderers, element, path, parameters, message);
        return renderers;
    }
});


/**
compileNode(renderers, node, path, parameters, message)
**/

const toNodeType = window.DEBUG ?
    (renderers, context, node) => {
        if (toType(context) === 'fragment') {
            throw new Error('context should never be a fragment');
        }

        if (!context) {
            throw new Error('context should never be ' + context);
        }

        return toType(node);
    } :
    (renderers, context, node) => toType(node) ;

const compileNode = overload(toNodeType, {
    'comment':  id,
    'doctype':  id,
    'document': compileChildren,
    'element':  compileElement,
    'fragment': compileChildren,

    'element': (renderers, context, element, path, parameters, message = '') =>
        compileElement(renderers, element, path, parameters, message = ''),

    'text': (renderers, parent, node, path, parameters, message = '') => {
        if (toType(parent) === 'fragment') {
            throw new Error('parent should never be a document fragment');
        }

        const string = node.nodeValue;
        if (!isLiteralString(string)) {
            return renderers;
        }

        const source = decode(string);
        if (window.DEBUG) {
            message = truncate(64, '<'
                + parent.tagName.toLowerCase() + '>'
                + source.trim()
                + '</' + parent.tagName.toLowerCase() + '>')
                + ' (' + message + ')' ;
        }

        renderers.push(new TextRenderer(source, parent, node, path, parameters, message));
        return renderers;
    },

    'default': () => {
        throw new Error('Literal: Cannot compile node');
    }
});

export default compileNode;

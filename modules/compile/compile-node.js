
import id                from '../../../fn/modules/id.js';
import overload          from '../../../fn/modules/overload.js';
import toType            from '../../../dom/modules/to-type.js';
import decode            from '../../../dom/modules/decode.js';
import indexOf           from '../dom/index-of.js';
import TextRenderer      from '../renderer/renderer-text.js';
import scope             from '../scope.js';
import compile           from './compile.js';
import { pathSeparator } from './constants.js';
import isLiteralString   from './is-literal-string.js';
import truncate          from './truncate.js';
import compileAttribute  from './compile-attribute.js';



const assign = Object.assign;


/*
compileChildren(targets, element, path, message, options)
*/

function compileChildren(targets, element, path, message = '', options) {
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

            compileNode(targets, children[n], path, message, options);
        }
    }

    return targets;
}


/*
compileAttributes(targets, node, path, message, options)
*/

function compileAttributes(targets, element, path, message = '', options) {
    // Attributes may be removed during parsing so copy the list before looping
    const attributes = Array.from(element.attributes);
    let n = -1, attribute;

    while (attribute = attributes[++n]) {
        compileAttribute(targets, element, attribute, path, message, options);
    }

    return targets;
}


/*
compileElement(targets, node, path, message, options)
*/

const compileElement = overload((targets, element) => element.tagName.toLowerCase(), {
    // Ignore <defs> and <template>, which we consider as inert. Templates
    // should have already been flattened into content anyway in compileChildren()
    'defs':     id,
    'template': id,

    // Do not parse the inner DOM of scripts
    'script':   compileAttributes,

    'textarea': (targets, element, path, message, options) => {
        // A <textarea> does not have children, its textContent becomes its value
        compileAttributes(targets, element, path, message, options);
        compileAttribute(targets, element, {
            localName: 'value',
            value:     element.textContent
        }, path, message, options);
        element.textContent = '';
        return targets;
    },

    'default': (targets, element, path, message, options) => {
        // Compiling children first means inner DOM to outer DOM, which allows
        // `<select>`, for example, to pick up the correct option value. If we
        // decide to change this order we should still make sure value attribute
        // is rendered after children.
        compileChildren(targets, element, path, message, options);
        compileAttributes(targets, element, path, message, options);
        return targets;
    }
});


/**
compileNode(targets, node, path, message, options)
**/

const compileNode = overload((targets, node) => toType(node), {
    'comment':  id,
    'doctype':  id,
    'document': compileChildren,
    'fragment': compileChildren,

    'element': (targets, element, path, message = '', options) => {
        compileElement(targets, element, (path ? path + pathSeparator : '') + indexOf(element), message = '', options);
        return targets;
    },

    'text': (targets, node, path, message = '', options) => {
        const string = node.nodeValue;
        if (!isLiteralString(string)) {
            return targets;
        }

        const source = decode(string);
        if (window.DEBUG) {
            const parent = node.parentElement || { tagName: 'template' };
            message = truncate(64, '<'
                + parent.tagName.toLowerCase() + '>'
                + source.trim()
                + '</' + parent.tagName.toLowerCase() + '>')
                + ' (' + message + ')' ;
        }

        //targets.push(new TextRenderer(path, indexOf(node), source, message, options, node));
        targets.push({
            source,
            message,
            fn: compile(source, scope, TextRenderer.parameterNames.join(', '), message, options),
            path,
            name: indexOf(node)
        });

        // Insert text node. When renderer is created with cloned DOM, clone of
        // `node` is assigned to `renderer.first` and the clone of this new text
        // node is assigned as `renderer.last`.
        node.after(document.createTextNode(''));

        return targets;
    },

    /*'default': () => {
        throw new Error('Literal: Cannot compile node');
    }*/
});

export default compileNode;

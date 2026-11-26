
import id                from 'fn/id.js';
import overload          from 'fn/overload.js';
import toType            from 'dom/to-type.js';
import decode            from 'dom/decode.js';
import indexOf           from '../dom/index-of.js';
import TextRenderer      from '../renderer/renderer-text.js';
import { printError }    from '../print.js';
import scope             from '../scope.js';
import { compileExpression, compileLiteral, rsingle } from './compile.js';
import isLiteralString   from './is-literal-string.js';
import truncate          from './truncate.js';
import compileAttribute  from './compile-attribute.js';


const DEBUG = globalThis.DEBUG;


/*
compileChildren(targets, element, path, options, template)
*/

function compileChildren(targets, element, path, options, template) {
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

            compileNode(targets, children[n], path, options, template);
        }
    }

    return targets;
}


/*
compileAttributes(targets, node, path, options, template)
*/

function compileAttributes(targets, element, path, options, template) {
    // Attributes may be removed during parsing so copy the list before looping
    const attributes = Array.from(element.attributes);
    let n = -1, attribute;

    while (attribute = attributes[++n]) {
        compileAttribute(targets, element, attribute, path, options, template);
    }

    return targets;
}


/*
compileElement(targets, node, path, options, template)
*/

const compileElement = overload((targets, element) => element.tagName.toLowerCase(), {
    // Ignore <defs> and <template>, which we consider as inert. Templates
    // should have already been flattened into content anyway in compileChildren()
    'defs':     id,
    'template': id,

    // Do not parse the inner DOM of scripts
    'script':   compileAttributes,

    'textarea': (targets, element, path, options, template) => {
        compileAttributes(targets, element, path, options, template);
        // A <textarea> does not have children, its textContent becomes its value
        compileAttribute(targets, element, {
            localName: 'value',
            value:     element.textContent
        }, path, options, template);
        element.textContent = '';
        return targets;
    },

    'default': (targets, element, path, options, template) => {
        // Compiling children first means inner DOM to outer DOM, which allows
        // `<select>`, for example, to pick up the correct option value. (Should
        // we decide to change this order we must make sure value attribute is
        // rendered after children.)
        compileChildren(targets, element, path, options, template);
        compileAttributes(targets, element, path, options, template);
        return targets;
    }
});


/**
compileNode(targets, node, path, options, template)
**/

const compileNode = overload((targets, node) => toType(node), {
    'comment':  id,
    'doctype':  id,
    'document': compileChildren,
    'fragment': compileChildren,
    'element': (targets, element, path = [], options, template) => {
        // Use .concat() so each branch gets its own immutable path snapshot
        compileElement(targets, element, path.concat(indexOf(element)), options, template);
        return targets;
    },
    'text': (targets, node, path, options, template) => {
        const string = node.nodeValue;
        if (!isLiteralString(string)) return targets;

        const source = decode(string);
        const match  = rsingle.exec(source);
        const target = {
            template,
            path,
            name: indexOf(node),
            source,
            Renderer: TextRenderer
        };

        let code;

        if (DEBUG) {
            // Add debug info to code and to compile object
            const parent = node.parentElement;
            const tag    = parent && parent.tagName.toLowerCase();

            code = truncate(80, tag ?
                '<' + tag + '>' + source.trim() + '</' + tag + '>' :
                source.trim()
            );

            target.tag  = tag;
            target.code = code;
        }

        // Attempt to compile single expression `${ expr }` render function...
        if (match) {
            try {
                target.literal = compileExpression(match[1], scope, TextRenderer.consts, options, code);
                target.singleExpression = true;
            }
            catch (_error) {}
        }

        // That failed where code was not really a single expression, so now
        // compile template literal render function
        if (!target.literal) {
            if (DEBUG) {
                try {
                    target.literal = compileLiteral(source, scope, TextRenderer.consts, options, code);
                }
                catch (error) {
                    // Replace node with an error element
                    node.replaceWith(printError(target, error));
                    return targets;
                }
            }
            else {
                // Compile template literal render function
                target.literal = compileLiteral(source, scope, TextRenderer.consts, options);
            }
        }

        // Empty the node
        node.nodeValue = '';

        // Add compiled target object to the list
        targets.push(target);
        return targets;
    }
});

export default compileNode;

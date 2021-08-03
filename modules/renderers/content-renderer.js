
import isFragmentNode from '../../../dom/modules/is-fragment-node.js';
import isTextNode     from '../../../dom/modules/is-text-node.js';
import trigger        from '../../../dom/modules/trigger.js';
import library        from '../library.js';
import include        from '../../library/include.js';
import request        from '../../library/request.js';
import compile        from '../compile.js';
import toText         from '../to-text.js';
import Renderer       from './renderer.js';

const DEBUG  = window.DEBUG === true || window.DEBUG && window.DEBUG.includes('literal');

const assign = Object.assign;

const contentLibrary = assign({}, library, {
    include: include,
    request: request
});




function renderValues(string, contents, array) {
    const l = array.length;
    let n = -1;
    while (++n < l) {
        string = renderValue(string, contents, array[n]);
    }
    return string;
}

function renderValue(string, contents, value) {
    if (value && typeof value === 'object') {
        // Array-like values are flattened recursively
        if (value && !value.nodeType && typeof value.length === 'number') {
            return renderValues(string, contents, value);
        }

        // Nodes are pushed into contents directly
        if (value instanceof Node) {
            string && contents.push(string);
            contents.push(value);
            return '';
        }

        if (value instanceof Promise) {
            string && contents.push(string);
            contents.push(value);
            return '';
        }
    }

    // If none of the above conditions were met value must coerce to a string
    return string + toText(value);
}


/**
ContentRenderer()
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert 
that DOM after the text node.
**/

function after(target, node) {
    target.after(node);
    return 1;
}

function remove(first, last) {
    var node, n = 0;
    while (last && last !== first) {
        node = last.previousSibling;
        last.remove();
        ++n;
        last = node;
    }
    return n;
}

function setNodeValue(node, value) {
    if (node.nodeValue !== value) {
        node.nodeValue = value;
        return 1;
    }

    return 0;
}

function setContent(node, children, contents) {
    let count = 0;
    let c;

    // Deal with the principal text node, setting it's text to the value
    // of contents[0] (if it is a string)
    if (typeof contents[0] === 'string') {
        count += setNodeValue(node, contents[0]);
        c = 0;
    }
    else {
        count += setNodeValue(node, '');
        c = -1;
    }

    let n = 0;
    let content;
//console.log('CONTENTS', contents);
    // Deal with rest of contents
    while (content = contents[++c]) {
//console.log(' CONTENT', content);
        // If content is a string look for the next text node ...
        if (typeof content === 'string') {
            // Throw away any non-text entries
            while (n < children.length && !isTextNode(children[n])) {
                count += remove(children[n - 1] || node, children[n]);
                children.splice(n, 1).forEach(trigger('literal-stop'));
            }

            // If child exists we know it is a text node, fill it with content
            if (children[n]) {
                count += setNodeValue(children[n], content);
            }

            // Otherwise create a text node with content
            else {
                const child = document.createTextNode(content);
                count += after(children[n - 1], child);
                children[n] = child;
            }
        }

        // If content is a promise put a marker node in place and replace it
        // when the promise produces content
        else if (content instanceof Promise) {
            // Insert a temporary marker node into children
            const tempMarker = document.createTextNode('');
            count += after(children[n - 1] || node, tempMarker);
            children.splice(n, 0, tempMarker);

            // When content is ready
            content.then((content) => {
                // Convert string to text node
                content = typeof content === 'string' ?
                    create('text', content) :
                    content ;

                // Find the last node, the new marker node, in fragment
                const marker = isFragmentNode(content) ? 
                    content.childNodes[content.childNodes.length - 1] : 
                    content ;

                // Replace tempMarker with new content
                tempMarker.before(content);
                tempMarker.remove();

                // Replace tempMarker in children with the new marker
                const n = children.indexOf(tempMarker);
                children[n] = marker;
            });
        }

        // If content is an array ?
        // Move array code in here from renderValue()

        // If content is a fragment or other DOM node
        else {
//console.log('CHILDREN', n, children);
            const last = isFragmentNode(content) ? 
                content.childNodes[content.childNodes.length - 1] : 
                content ;

            count += after(children[n - 1] || node, content);
            children.splice(n, 0, last);
        }

        ++n;
    }

    // Throw away any remaining children
    const dead = children.splice(n);
    if (dead.length) {
        count += remove(children[n - 1] || node, dead[dead.length - 1]);
        dead.forEach(trigger('literal-stop'));
    }

    // Return the number of contents appended to DOM
    return count;
}

export default function ContentRenderer(node, options, element) {
    Renderer.apply(this, arguments);
    const children = this.children = [];
    this.literally = options.literally || compile(contentLibrary, 'data, state', options.source, null, options, element);
    this.update  = (contents) => setContent(node, children, contents);
    //console.log('ContentRenderer', this.id, this.element);
}

assign(ContentRenderer.prototype, Renderer.prototype, {
    resolve: function(values) {
        const strings  = values[0];
        const contents = [];
    
        let n = -1;
        let string = '';
    
        while (strings[++n] !== undefined) {
            // Append to string until it has to be pushed to contents because
            // a node or renderer has to be pushed in behind it
            string = renderValue(string + strings[n], contents, values[n + 1]);
        }
    
        string && contents.push(string);
        return contents;
    }
});

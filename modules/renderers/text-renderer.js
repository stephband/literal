
import library        from '../library.js';
import include        from '../../library/include.js';
//import request        from '../../library/request.js';
import compile        from '../compile.js';
import toText         from '../to-text.js';
import Renderer, { removeNodes } from './renderer.js';
import analytics      from './analytics.js';

const assign = Object.assign;
/*
const contentLibrary = assign({}, library, {
    include: include,
    request: request
});
*/
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
        if (value && typeof value === 'object' && !value.nodeType && typeof value.length === 'number') {
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
TextRenderer()
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert 
that DOM after the text node.
**/

function setNodeValue(node, value) {
    if (node.nodeValue !== value) {
        node.nodeValue = value;
        return 1;
    }

    return 0;
}

function stop(node) {
    node && typeof node === 'object' && node.stop && node.stop();
}

function setContent(first, last, contents) {
    let count = 0;

    // Remove existing nodes, leaving first and last alone
    if (last.previousSibling !== first) {
        count += removeNodes(first.nextSibling, last.previousSibling);
    }

    // Set first tet node
    if (typeof contents[0] === 'string') {
        count += setNodeValue(first, contents.shift());
    }
    else {
        count += setNodeValue(first, '');
    }

    // Set last text node
    if (typeof contents[contents.length - 1] === 'string') {
        count += setNodeValue(last, contents.pop());
    }
    else {
        count += setNodeValue(last, '');
    }

    if (contents.length) {
        first.after.apply(first, contents);
        count += contents.length;
    }

    return count;
}

export default function TextRenderer(node, options, element) {
    Renderer.apply(this, arguments);

    this.first     = node;
    this.last      = document.createTextNode('');
    this.first.after(this.last);
    this.contents  = [];
    this.literally = options.literally || compile(library, 'data, state, element', options.source, null, options, element);
    
    // Analytics
    const id = '#' + options.template;
    ++analytics[id].text || (analytics[id].text = 1);
    ++analytics.Totals.text;
}

assign(TextRenderer.prototype, Renderer.prototype, {
    render: function() {
        // Stop all nodes, they are about to be recreated
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.render.apply(this, arguments);
    },

    resolve: function(strings) {
        const contents = this.contents;

        contents.forEach(stop);
        contents.length = 0;

        let n = -1;
        let string = '';
    
        while (strings[++n] !== undefined) {
            // Append to string until it has to be pushed to contents because
            // a node or renderer has to be pushed in behind it
            string = renderValue(string + strings[n], contents, arguments[n]);
        }

        string && contents.push(string);
        return setContent(this.first, this.last, contents);
    },

    stop: function() {
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.stop.apply(this, arguments);
    }
});

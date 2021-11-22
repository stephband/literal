
/**
ContentRenderer()
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert 
that DOM after the text node.
**/

import library        from '../library.js';
import compile        from '../compile.js';
import toText         from '../to-text.js';
import include        from '../../library/include.js';
import Renderer, { removeNodes } from './renderer.js';
import TemplateRenderer from './template-renderer.js';
import { StreamRenderer, ArrayRenderer, PromiseRenderer } from './content-renderers.js';
import analytics      from './analytics.js';


const assign = Object.assign;


function renderValues(renderer, string, array) {
    const l = array.length;
    let n = -1;
    while (++n < l) {
        string = renderValue(renderer, string, array[n]);
    }
    return string;
}

function renderValue(renderer, string, value) {
    const contents = renderer.contents;

    if (value && typeof value === 'object') {
        // Array-like values are flattened recursively
        if (!value.nodeType && typeof value !== 'function' && typeof value.length === 'number') {
            return renderValues(renderer, string, value);
        }

        // Nodes are pushed into contents directly
        if (value instanceof Node) {
            string && contents.push(string);
            contents.push(value);
            return '';
        }

        // Value is a TemplateRenderer
        if (value instanceof TemplateRenderer) {
            string && contents.push(string);
            contents.push(value);
            return '';
        }

        // Value is a Stream
        if (value.each) {
            string && contents.push(string);
            contents.push(new StreamRenderer(renderer, value));
            return '';
        }

        // Value is a Promise
        if (value instanceof Promise) {
            string && contents.push(string);
            contents.push(new PromiseRenderer(renderer, value))
            return '';
        }
    }

    // If none of the above conditions were met value must coerce to a string
    return string + toText(value);
}

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

function toContent(object) {
    return typeof object === 'string' ? object :
        object.content ? toContent(object.content) :
        object ;
}

function setContents(first, last, contents, state) {
    let count = 0;
    
    // TODO: get rid of need to slice
    const nodes = contents.map(toContent);

    // Remove existing nodes, leaving first and last alone
    if (last.previousSibling !== first) {
        count += removeNodes(first.nextSibling, last.previousSibling);
    }

    // Set first text node
    if (typeof contents[0] === 'string') {
        count += setNodeValue(first, nodes.shift());
    }
    else {
        count += setNodeValue(first, '');
    }

    // Set last text node
    if (typeof nodes[nodes.length - 1] === 'string') {
        count += setNodeValue(last, nodes.pop());
    }
    else {
        count += setNodeValue(last, '');
    }

    if (nodes.length) {
        first.after.apply(first, nodes);
        state === 'dom' && contents.forEach((renderer) =>
            (typeof renderer === 'object' && renderer.connect && renderer.connect())
        );
        count += contents.length;
    }

    return count;
}

export default function ContentRenderer(node, options, element) {
    Renderer.apply(this, arguments);

    this.first     = node;
    this.last      = document.createTextNode('');
    this.first.after(this.last);
    this.contents  = [];
    this.literally = options.literally || compile(library, 'data, element, include', options.source, null, options, element);
    this.include   = (template, data) => include(template, data, element);

    // Analytics
    const id = '#' + options.template;
    ++analytics[id].text || (analytics[id].text = 1);
    ++analytics.Totals.text;
}

assign(ContentRenderer.prototype, Renderer.prototype, {
    push: function() {
        // Preemptively stop all nodes, they are about to be updated
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.push.apply(this, arguments);
    },

    render: function(data) {
        // Stop all nodes, they are about to be recreated. This needs to be done
        // here as well as render, as update may be called by TemplateRenderer
        // without going through .push() cueing first.
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.render.call(this, data, this.element, this.include);
    },

    compose: function(strings) {
        let n = -1;
        let string = '';
    
        while (strings[++n] !== undefined) {
            // Append to string until it has to be pushed to contents because
            // a node or renderer has to be pushed in behind it
            string = renderValue(this, string + strings[n], arguments[n + 1]);
        }

        string && this.contents.push(string);
        return setContents(this.first, this.last, this.contents, this.status);
    }
});

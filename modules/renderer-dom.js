
/**
DOMRenderer()
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert
that DOM after the text node.
**/

import include          from '../library/include-literal.js';
import library          from './library.js';
import toText           from './to-text.js';
import Renderer         from './renderer.js';
import removeNodes      from './remove-nodes.js';
import TemplateRenderer from './renderer-template.js';

const assign = Object.assign;

function stop(node) {
    node && typeof node === 'object' && node.stop && node.stop();
}

function toRenderer(value) {
    return (value && typeof value === 'object') ?
        value instanceof Node ? value :
        value instanceof TemplateRenderer ? value :
        toText(value) :
        toText(value) ;
}

function pushContents(contents, object) {
    if (typeof object === 'string' && typeof contents[contents.length] === 'string') {
        contents[contents.length] += object;
    }
    else {
        contents.push(object);
    }

    return contents;
}

function composeDOM(contents, object) {
    if (Array.isArray(object)) {
        return object.reduce(composeDOM, contents);
    }

    return pushContents(contents, toRenderer(object));
}

function setNodeValue(node, value) {
    if (node.nodeValue !== value) {
        node.nodeValue = value;
        return 1;
    }

    return 0;
}

function toContent(object) {
    return typeof object === 'string' ? object :
        object.content ? toContent(object.content) :
        object ;
}

function setContents(first, last, contents, state) {
    let count = 0;
    const nodes = contents.map(toContent);

    // Remove existing nodes, leaving first and last alone
    if (first.nextSibling && last.previousSibling !== first) {
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
        /*state === 'dom' && contents.forEach((renderer) =>
            (typeof renderer === 'object' && renderer.connect && renderer.connect())
        );*/
        count += contents.length;
    }

    return count;
}

export default function DOMRenderer(source, consts, path, node, name, element) {
    Renderer.call(this, source, library, {
        element: node,
        include: (url, data) => (data ?
            include(url, data, element) :
            (data) => include(url, data, element)
        )
    }, consts);

    this.path      = path;
    this.node      = node;
    this.first     = node;
    this.last      = document.createTextNode('');
    this.first.after(this.last);
    this.contents  = [];
}

assign(DOMRenderer.prototype, Renderer.prototype, {
    push: function() {
        // Preemptively stop all nodes, they are about to be updated
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.push.apply(this, arguments);
    },

    update: function() {
        // Stop all nodes, they are about to be recreated. This needs to be done
        // here as well as render, as update may be called by TemplateRenderer
        // without going through .push() cueing first. (??)
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.update.call(this);
    },

    render: function(strings) {
        let n = 0;
        this.contents.push(strings[0]);

        while (strings[++n] !== undefined) {
            composeDOM(this.contents, arguments[n]);
            pushContents(this.contents, strings[n]);
        }

        this.mutations = setContents(this.first, this.last, this.contents, this.status);
        return this;
    },

    stop: function() {
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.stop.apply(this);
    }
});

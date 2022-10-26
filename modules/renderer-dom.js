
/**
DOMRenderer()
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert
that DOM after the text node.
**/

import include           from './library/include.js';
import library           from './library-dom.js';
import toText            from './to-text.js';
import Renderer          from './renderer.js';
import removeNodes       from './remove-nodes.js';
import TemplateRenderer  from './renderer-template.js';
import { pathSeparator } from './constants.js';
import print             from './library/print.js';

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
    // Flatten nested arrays of renderables
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

    // Remove existing nodes, leaving first and last alone
    if (first.nextSibling && last.previousSibling !== first) {
        count += removeNodes(first.nextSibling, last.previousSibling);
    }

    // Set first text node, contents[0] is always a string
    count += setNodeValue(first, contents[0]);

    // Set last text node, contents[-1] is always a string
    count += setNodeValue(last, contents[contents.length - 1]);

    const nodes = contents.map(toContent).slice(1, contents.length - 1);

    if (nodes.length) {
        first.after.apply(first, nodes);
        count += contents.length;
    }

    return count;
}

export default function DOMRenderer(source, consts, template, path, node, name, message, parameters) {
    Renderer.call(this, source, library, assign({}, parameters, {
        // If path is empty node is a direct child of a template, but if not
        // element should be set to this text node's parent
        element: !path.includes(pathSeparator) ?
            parameters.element :
            node.parentNode,

        include: (url, data) => (data ?
            // Do we must update element here? No, right?
            include(url, data, parameters) :
            (data) => include(url, data, parameters)
        ),

        print: (...args) => print(this, ...args)
    }), consts, message);

    this.template = template;
    this.path     = path;
    this.node     = node;
    this.first    = node;
    this.last     = document.createTextNode('');
    this.first.after(this.last);
    this.contents = [];
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

        this.contents.length = 0;
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

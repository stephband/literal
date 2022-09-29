
/**
DOMRenderer()
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert
that DOM after the text node.
**/

import curry            from '../../fn/modules/curry.js';
import include          from '../library/include-literal.js';
import library          from './library.js';
import toText           from './to-text.js';
import Renderer         from './renderer.js';
import removeNodes      from './remove-nodes.js';
import TemplateRenderer from './renderer-template.js';
//import { StreamRenderer, ArrayRenderer, PromiseRenderer, isStream } from './content-renderers.js';


const assign = Object.assign;

function toRenderer(value) {
    // `this` should be the parent renderer
    const parent = this;

    return (!value || typeof value !== 'object') ?
            toText(value) :
        value instanceof Node ?
            value :
        value instanceof TemplateRenderer ?
            value :
        (typeof value.length === 'number') ?
            new ArrayRenderer(value) :
        value instanceof Promise ?
            new PromiseRenderer(value, parent) :
        isStream(value) ?
            new StreamRenderer(value) :
        toText(value) ;
}

function renderValue(domRenderer, string, value) {
    const contents = domRenderer.contents;
    const renderer = toRenderer.call(parent, value);

    if (typeof renderer === 'string') {
        return string + renderer;
    }

    string && contents.push(string);
    contents.push(renderer);
    return '';
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
        state === 'dom' && contents.forEach((renderer) =>
            (typeof renderer === 'object' && renderer.connect && renderer.connect())
        );
        count += contents.length;
    }

    return count;
}

export default function DOMRenderer(source, consts, path, node, name, element) {
    Renderer.call(this, source, library, { element: node, include: () => {} }, consts);

    this.path      = path;
    this.element   = element;
    this.node      = node;
    this.first     = node;
    this.last      = document.createTextNode('');
    this.first.after(this.last);
    this.contents  = [];

    // Renderer scoped template functions
    this.include = curry((template, data) => include(template, data, element));

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

    compose: function(strings) {
        let n = -1;
        let string = '';

        while (strings[++n] !== undefined) {
            // Append to string until it has to be pushed to contents because
            // a node or renderer has to be pushed in behind it
            string = renderValue(this, string + strings[n], arguments[n + 1]);
        }

        string && this.contents.push(string);
        this.mutations = setContents(this.first, this.last, this.contents, this.status);
        return this;
    },

    stop: function() {
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.stop.apply(this);
    }
});

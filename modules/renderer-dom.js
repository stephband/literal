
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
import isTextNode from '../../dom/modules/is-text-node.js';

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
    const last = contents[contents.length];

    if (typeof object === 'string' && typeof last === 'string') {
        contents[contents.length] = last + object;
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
    return object.content ?
        toContent(object.content) :
        object ;
}

function updateDOM(first, last, contents) {
    let node = first;
    let c    = -1;
    let object, count = 0;

    while (++c < contents.length - 1) {
        object = contents[c];

        if (typeof object === 'string') {
            // If there's a text node (but not last) lined up, populate it
            if (isTextNode(node) && node !== last) {
                count += setNodeValue(node, object);
                node = node.nextSibling;
            }
            // Otherwise insert a new text node
            else {
                node.before(object);
            }
        }

        // If a renderer's nodes are already in the right place in the DOM,
        // skip over them by setting node to object.last
        else if (object instanceof TemplateRenderer && node === object.first) {
            node = object.last.nextSibling;
        }

        // If node is object, move right on
        else if (node === object) {
            console.log('DO WE GET HERE EVER? Not sure the logics right, it just feels like the right thing to do.');
            if (node !== last) {
                node = node.nextSibling;
            }
        }

        // Object is not in sync with the DOM
        else {
            // Remove template or node from wherever it currently is
            if (object.remove) {
                count += (object.remove() || 0);
            }

            // And put it here
            node.before(toContent(object));
            ++count;
        }
    }

    // Remove unused nodes up until last
    while (node && node !== last) {
        const n = node;
        node = node.nextSibling;
        n.remove();
        ++count;
    }

    // Set last text node, contents[-1] is always a string
    count += setNodeValue(last, contents[c]);
    return count;
}

export default function DOMRenderer(source, template, path, node, name, message, parameters) {
    Renderer.call(this, source, library, assign({}, parameters, {
        // If path is empty node is a direct child of a template, but if not
        // element should be set to this text node's parent
        element: !path.includes(pathSeparator) ?
            parameters.element :
            node.parentNode,

        include: (url, data) => (data === undefined ?
            // Partial application if called with url only
            (data) => include(url, data, parameters) :
            include(url, data, parameters)
        ),

        print: (...args) => print(this, ...args)
    }), message);

    this.template = template;
    this.path     = path;
    this.node     = node;
    this.first    = node;
    this.last     = document.createTextNode('');
    this.contents = [];

    this.first.after(this.last);
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
        // here as well as in push, as update may be called by TemplateRenderer
        // without going through .push() cueing first. (??)
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.update.call(this);
    },

    render: function(strings) {
        let n = 0;

        this.contents.length = 0;
        this.contents.push(strings[n]);

        while (strings[++n] !== undefined) {
            composeDOM(this.contents, arguments[n]);
            pushContents(this.contents, strings[n]);
        }

        this.mutations = updateDOM(this.first, this.last, this.contents);
        return this;
    },

    stop: function() {
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.stop.apply(this);
    }
});


/**
TextRenderer(source, node, path, parameters, message)
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert
that DOM after the text node.
**/

import isTextNode        from '../../../dom/modules/is-text-node.js';
import include           from '../library/include.js';
import library           from '../library-dom.js';
import removeNodes       from '../remove-nodes.js';
import TemplateRenderer  from '../renderer-template.js';
import { pathSeparator } from '../constants.js';
import print             from '../library/print.js';
import toText            from './to-text.js';
import Renderer          from './renderer.js';

const A      = Array.prototype;
const assign = Object.assign;


function stop(node) {
    node && typeof node === 'object' && node.stop && node.stop();
}

function toRenderer(value) {
    return value instanceof TemplateRenderer ? value :
           value instanceof Node ? value :
           toText(value) ;
}

function pushContents(contents, object) {
    // Object may be a string, DOM node, fragment, template renderer. Here
    // we concat strings together. May have side effects on complicated DOM
    // updates, so keep an eye out.
    if (typeof object === 'string' && typeof contents[contents.length - 1] === 'string') {
        contents[contents.length - 1] += object;
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

function indexOf(node) {
    // Get the index of a DOM node
    return A.indexOf.apply(node.parentNode.childNodes, arguments);
}

function updateDOM(first, last, objects) {
    // Sanity check
    if (window.DEBUG) {
        if (first === last) {
            throw new Error('`first` and `last` are the same node');
        }

        if (first.parentNode !== last.parentNode) {
            throw new Error('`first` and `last` are not siblings');
        }

        const children = first.parentNode.childNodes;
        const iFirst   = A.indexOf.call(children, first);
        const iLast    = A.indexOf.call(children, last);
        if (iFirst > iLast) {
            throw new Error('`last` is not after `first`, first: ' + iFirst + ' last: ' + iLast);
        }
    }

    //console.log(0, 'updateDOM', first.textContent, last.textContent, objects, nLast);
    const nLast = objects.length - 1;

    // Render first object. `objects[0]` is always a string. `first` is a
    // text node.
    let count = setNodeValue(first, objects[0]);
    let node  = first.nextSibling;
    let n     = 0;

    while (++n < nLast) {
        const object = objects[n];

        // Is object a string
        if (typeof object === 'string') {
            // If node is a text node, use it.
            if (node !== last && isTextNode(node)) {
                count += setNodeValue(node, object);
                node = node.nextSibling;
            }
            // ...otherwise insert a text node
            else {
                node.before(object);
            }
            continue;
        }

        // Is object a TemplateRenderer with nodes already in this DOM
        if (object instanceof TemplateRenderer && (node === object.first || node === object.last)) {
            // Skip over nodes handled by the renderer
            node = object.last.nextSibling;
            continue;
        }

        // If node and object are the same thing. Could happen, I suppose, if
        // a template expression returns a cached node on successive renders.
        if (node === object) {
            node = node.nextSibling;
            continue;
        }

        // Remove template or node from wherever it currently is
        if (object.remove) {
            count += (object.remove() || 0);
        }

        // And put it here
        node.before(toContent(object));
        ++count;
    }

    // Remove unused nodes up to last
    while (node !== last) {
        const nd = node;
        node = node.nextSibling;
        nd.remove();
        ++count;
    }

    // Render last object. Where objects is less than 1 item long empty `last`,
    // otherwise render last object into `last`.
    return count + setNodeValue(last, nLast < 1 ? null : objects[nLast]);
}

export default function TextRenderer(source, node, path, parameters, message) {
    Renderer.call(this, source, library, assign({}, parameters, {
        // If path is empty...
        element: !path.includes(pathSeparator) ?
            // node is a direct child of a template...
            parameters.element :
            // but if not element should be set to this text node's parent.
            node.parentNode,

        include: (url, data) => (data === undefined ?
            // Partial application if called with url only
            (data) => include(url, data, parameters) :
            // Include immediately when data is defined
            include(url, data, parameters)
        ),

        print: (...args) => print(this, ...args)
    }), message);

    this.contents = [];
    this.path     = path;
    this.first    = node;
    this.last     = document.createTextNode('');
    this.first.after(this.last);
}

assign(TextRenderer.prototype, Renderer.prototype, {
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

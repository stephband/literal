
import create         from '../../../dom/modules/create.js';
import library        from '../library.js';
import compile        from '../compile.js';
import toText         from '../to-text.js';
import analytics, { meta } from './analytics.js';
import Renderer, { removeNodes } from './renderer.js';
import TemplateRenderer from './template-renderer.js';
import print          from '../../library/print.js';
import { cue }        from './batcher.js';
import { log }        from '../log.js';

const assign = Object.assign;

function replaceObjectContent(renderer, value) {
    // Value is not an object
    if (!value || typeof value !== 'object') {
        return false;
    }

    // Array-like values are flattened recursively
    if (!value.nodeType && typeof value.length === 'number') {
        console.log('TODO: promised or streamed value is an array - deal wid\' it');
        return true;
    }

    // Nodes are pushed into contents directly
    if (value instanceof Node) {
        log('replace', renderer.constructor.name + ' ➔ Node ' + value, renderer.status === 'dom' ? 'DOM' : undefined, undefined, 'aqua');
        renderer.content.replaceWith(value);
        renderer.content = value;
        return true;
    }

    // Value is a TemplateRenderer
    if (value instanceof TemplateRenderer) {
        log('replace', renderer.constructor.name + ' #' +  renderer.id + ' ➔ ' + value.constructor.name + ' #' +  value.id + ' #' + value.template.id, renderer.status === 'dom' ? 'DOM' : undefined, undefined, 'aqua');
        renderer.content.replaceWith(value.content);
        renderer.content = value;
        renderer.status === 'dom' && value.connect();
        return true;
    }

    // Value is a Stream
    if (value.each) {
        const child = new StreamRenderer(renderer.collection, value);
        log('replace', renderer.constructor.name + ' #' +  renderer.id + ' ➔ ' + child.constructor.name + ' #' +  child.id, renderer.status === 'dom' ? 'DOM' : undefined, undefined, 'aqua');
        renderer.content.replaceWith(child.content);
        renderer.content = child;
        renderer.status === 'dom' && child.connect();
        return true;
    }
    
    // Value is a Promise
    if (value.then) {
        const child = new PromiseRenderer(renderer.collection, value);
        log('replace', renderer.constructor.name + ' #' +  renderer.id + ' ➔ ' + child.constructor.name + ' #' +  child.id, renderer.status === 'dom' ? 'DOM' : undefined, undefined, 'aqua');
        renderer.content.replaceWith(child.content);
        renderer.content = child;
        renderer.status === 'dom' && child.connect();
        return true;
    }
}

/* PromiseRenderer */

function PromiseRenderer(contents, promise) {
    // Parent collection
    this.collection = contents;
    // Marker content
    this.content = create('text', '');
    this.id      = ++meta.count;

    promise
    .then(value => this.status !== 'done' && this.push(value))
    .catch(e => this.print(e));
}

assign(PromiseRenderer.prototype, {
    push: function(value) {
        this.status !== 'done' && cue(this, arguments);
        return this;
    },

    render: function(value) {
        // Replace this promise renderer in the contents collection, 
        // effectively retiring it from active service
        if (!replaceObjectContent(this, value)) {
            this.content.textContent = toText(value);
        }

        //replace(this.collection, this, this.content);
        this.status = 'done';
        return 1;
    },

    print: window.DEBUG ?
        function(e) { this.content.replaceWith(print(e)) } :
        function() { this.content.remove(); },

    remove: function() {
        this.content.remove();
    },

    replaceWith: function(node) {
        this.content.replaceWith(node);
    },

    stop: function() {
        if (this.status === 'done') { return; }
        this.status = 'done';
        this.content.stop && this.content.stop();
    },

    connect: function() {
        if (this.status === 'dom') { return; }
        this.status = 'dom';
        this.content.connect && this.content.connect();
    }
});


/* SteeamRenderer */

function StreamRenderer(collection, stream) {
    // Marker node
    const marker = create('text', '');
    this.marker  = marker;
    this.content = marker;
    this.collection = collection;
    this.id      = ++meta.count;
    this.stream  = stream;

    stream.pipe(this);
}

assign(StreamRenderer.prototype, PromiseRenderer.prototype, {
    render: function(value) {
        stop(this.content);

        if (replaceObjectContent(this, value)) {
            return 1;
        }

        // Value is converted to a string
        this.marker.textContent = toText(value);
        if (this.content !== this.marker) {
            this.content.replaceWith(this.marker);
            this.content = this.marker;
        }

        return 1;
    },

    stop: function() {
        if (this.status === 'done') { return; }
        this.status = 'done';
        this.stream.stop && this.stream.stop();
        this.content.stop && this.content.stop();
    }
});


/* ContentRenderer */

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
        if (!value.nodeType && typeof value.length === 'number') {
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
            contents.push(new StreamRenderer(contents, value));
            return '';
        }

        // Value is a Promise
        if (value instanceof Promise) {
            string && contents.push(string);
            contents.push(new PromiseRenderer(contents, value))
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
    this.literally = options.literally || compile(library, 'data, element', options.source, null, options, element);

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

    render: function() {
        // Stop all nodes, they are about to be recreated. This needs to be done
        // here as well as render, as update may be called by TemplateRenderer
        // without going through .push() cueing first.
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.render.apply(this, arguments);
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

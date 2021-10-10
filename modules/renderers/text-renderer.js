
import create         from '../../../dom/modules/create.js';
import library        from '../library.js';
import compile        from '../compile.js';
import toText         from '../to-text.js';
import Renderer, { removeNodes } from './renderer.js';
import TemplateRenderer from './template-renderer.js';
import analytics      from './analytics.js';
import print          from '../../library/print.js';

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
        renderer.content.replaceWith(value);
        renderer.content = value;
        return true;
    }

    // Value is a TemplateRenderer
    if (value instanceof TemplateRenderer) {
        renderer.content.replaceWith(value.content);
        renderer.content = value;
        return true;
    }

    // Value is a Stream
    if (value.each) {
        const child = new StreamRenderer(value);
        renderer.content.replaceWith(child.content);
        renderer.content = child;
        return true;
    }
    
    // Value is a Promise
    if (value.then) {
        const child = new PromiseRenderer(value);
        renderer.content.replaceWith(child.content);
        renderer.content = child;
        return true;
    }
}

/* PromiseRenderer */

function PromiseRenderer(promise) {
    // Marker content
    this.content = create('text', '');
    this.status  = 'pending';

    promise
    .then(value => this.status !== 'done' && this.push(value))
    .catch(e => this.status !== 'done' && this.print(e));
}

assign(PromiseRenderer.prototype, {
    // TODO: make push delegate to cue() ??
    push: function(value) {
        if (replaceObjectContent(this, value)) {
            return this;
        }

        this.content.textContent = toText(value);
        return this;
    },

    print: window.DEBUG ?
        function(e) { this.marker.before(print(e)) } :
        function() { this.marker.remove() },

    stop: function() {
        this.status = 'done';
        console.log('TODO: stop the promise');
    },

    replaceWith: function(node) {
        this.content.replaceWith(node);
        //this.marker = node;
    }
});


/* SteeamRenderer */

function StreamRenderer(stream) {
    // Marker node
    const marker = create('text', '');
    this.marker  = marker;
    this.content = marker;
    
    stream.pipe(this).start();
}

assign(StreamRenderer.prototype, {
    // TODO: make push delegate to cue() ??
    push: function(value) {
        stop(this.content);

        if (replaceObjectContent(this, value)) {
            return this;
        }

        // Value is converted to a string
        this.marker.textContent = toText(value);
        if (this.content !== this.marker) {
            console.log('CC', value);
            this.content.replaceWith(this.marker);
            this.content = this.marker;
        }

        return this;
    },

    stop: function() {
        console.log('TODO: stop the stream');
    },

    replaceWith: function(node) {
        this.content.replaceWith(node);
    }
});


/*  */

function renderValues(contents, string, array) {
    const l = array.length;
    let n = -1;
    while (++n < l) {
        string = renderValue(contents, string, array[n]);
    }
    return string;
}

function renderValue(contents, string, value) {
    if (value && typeof value === 'object') {
        // Array-like values are flattened recursively
        if (!value.nodeType && typeof value.length === 'number') {
            return renderValues(contents, string, value);
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
            contents.push(new StreamRenderer(value));
            return '';
        }

        // Value is a Promise
        if (value instanceof Promise) {
            string && contents.push(string);
            contents.push(new PromiseRenderer(value))
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

function toContent(object) {
    return typeof object === 'string' ? object :
        object.content ? toContent(object.content) :
        object ;
}

function setContent(first, last, contents) {
    let count = 0;
    contents = contents.slice().map(toContent);

    // Remove existing nodes, leaving first and last alone
    if (last.previousSibling !== first) {
        count += removeNodes(first.nextSibling, last.previousSibling);
    }

    // Set first text node
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
        // Preemptively stop all nodes, they are about to be updated
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.render.apply(this, arguments);
    },

    update: function() {
        // Stop all nodes, they are about to be recreated. This needs to be done
        // here as well as render, as update may be called by TemplateRenderer
        // without going through .render() cueing first.
        this.contents.forEach(stop);
        this.contents.length = 0;
        return Renderer.prototype.update.apply(this, arguments);
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
            string = renderValue(contents, string + strings[n], arguments[n + 1]);
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

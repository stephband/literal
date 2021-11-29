

import create           from '../../../dom/modules/create.js';
import print            from '../library/print.js';
import toText           from '../modules/to-text.js';
import TemplateRenderer from './template-renderer.js';
import { cue }          from './batcher.js';
import { log }          from '../modules/log.js';
import { meta }         from './analytics.js';

const assign = Object.assign;

export function isStream(object) {
    return !!object.each;
}

function connect(object) {
    object && object.connect && object.connect();
}

function remove(object) {
    object.remove();
}

function stop(object) {
    object && object.stop && object.stop();
}

function toRenderer(value) {
    // `this` should be the parent renderer
    const parent = this;

    return (!value || typeof value !== 'object') ?
            create('text', toText(value)) :
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
        create('text', toText(value)) ;
}

/* ArrayRenderer */

function toContent(object) {
    return object && typeof object === 'object' && object.content ?
        toContent(object.content) :
        object ;
}

export function ArrayRenderer(array) {
    this.id       = ++meta.count;
    this.contents = array.map(toRenderer, this);
    this.content  = create('fragment', '');
    this.first    = create('text', '');

    // Render content to content fragment
    this.content.append(this.first);
    this.content.append.apply(this.content, this.contents.map(toContent));
}

assign(ArrayRenderer.prototype, {
    replaceWith: function(node) {
        this.stop();
        this.contents.forEach(remove);
        this.first.replaceWith.apply(this.first, arguments);
    },

    remove: function() {
        this.contents.forEach(remove);
        this.first.remove();
    },

    stop: function() {
        if (this.status === 'done') { return; }
        this.status = 'done';
        this.contents.forEach(stop);
    },

    connect: function() {
        if (this.status === 'dom') { return; }
        this.status = 'dom';
        this.contents.forEach(connect);
    }
});


/* PromiseRenderer */

export function PromiseRenderer(promise, parent) {
    this.id      = ++meta.count;
    this.parent  = parent;
    this.content = create('text', '');

    promise
    .then((value) => this.push(value))
    .catch((e) => this.print(e))
    .finally(() => this.stop());
}

assign(PromiseRenderer.prototype, {
    push: function(value) {
        // A promise may resolve after we have stopped its renderer, catch this
        this.status !== 'done' && cue(this, arguments);
    },

    render: function(value) {
        // Replace this promise renderer. Note that value cannot be a promise
        // here – promise cannot resolve to a promise.
        const renderer = toRenderer(value);
        const content  = toContent(renderer);

        this.content.replaceWith(content);
        // A bit fudgy, it's a shame this renderer has to know about its parent
        this.parent.content = renderer;
        this.stop();

        // If we're in the DOM, signal connected state
        if (this.parent.status === 'dom') {
            renderer.connect && renderer.connect();
        }

        return 1;
    },

    replaceWith: function(node) {
        this.content.replaceWith(node);
    },

    print: window.DEBUG ?
        function(e) { this.content.replaceWith(print(e)) } :
        function() { this.content.remove(); },

    remove: function() {
        this.content.remove();
    },

    stop: function() {
        this.status = 'done';
    },

    connect: function() {
        this.status = 'dom';
    }
});


/* StreamRenderer */

export function StreamRenderer(stream) {
    this.id      = ++meta.count;
    this.parent  = parent;
    this.content = create('text', '');
    this.stream  = stream;
    stream.pipe(this);
}

assign(StreamRenderer.prototype, PromiseRenderer.prototype, {
    render: function(value) {
        const renderer = toRenderer.call(this, value);
        const content  = toContent(renderer);

        this.content.stop && this.content.stop();
        this.content.replaceWith(content);
        this.content = renderer;

        // If we're in the DOM, signal connected state
        if (this.status === 'dom') {
            renderer.connect && renderer.connect();
        }

        return 1;
    },

    stop: function() {
        if (this.status === 'done') { return; }
        this.status = 'done';
        this.stream.stop && this.stream.stop();
        this.content.stop && this.content.stop();
    },

    connect: function() {
        if (this.status === 'dom') { return; }
        this.status = 'dom';
        this.content.connect && this.content.connect();
    }
});



import create           from '../../../dom/modules/create.js';
import print            from '../../library/print.js';
import toText           from '../to-text.js';
import TemplateRenderer from './template-renderer.js';
import { cue }          from './batcher.js';
import { log }          from '../log.js';
import { meta }         from './analytics.js';

const assign = Object.assign;

function isStream(object) {
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

function toRenderer(parent, value) {
    return (!value || typeof value !== 'object') ?
            create('text', toText(value)) :
        value instanceof Node ?
            value :
        value instanceof TemplateRenderer ?
            value.content :
        (typeof value.length === 'number') ?
            new ArrayRenderer(parent, value) :
        value instanceof Promise ?
            new PromiseRenderer(parent, value) :
        isStream(value) ?
            new StreamRenderer(parent, value) :
        create('text', toText(value)) ;
}

/* ArrayRenderer */

function toContent(object) {
    return object && typeof object === 'object' && object.content ?
        toContent(object.content) :
        object ;
}

export function ArrayRenderer(parent, array) {
    this.id       = ++meta.count;
    this.parent   = parent;
    this.contents = array.map(toRenderer);
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

        if (this.parent.contents) {
            const i = this.parent.contents.indexOf(this);
            if (window.DEBUG && i === -1) {
                throw new Error('Renderer not found in parent contents array. Summat\'s up.');
            }
    
            this.parent.contents[i] = node;
        }

        if (this.status === 'dom') {
            node.connect && node.connect();
        }
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

export function PromiseRenderer(parent, promise) {
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
        this.status !== 'done' && cue(this, arguments);
        return this;
    },

    render: function(value) {
        // Replace this promise renderer in the contents contents, 
        // effectively retiring it from active service
        const renderer = toRenderer(this.parent, value);
        this.replaceWith(renderer);
        this.stop();
        return 1;
    },

    replaceWith: function(renderer) {
        // Replace this content with the new node
        this.content.replaceWith(toContent(renderer));

        if (this.parent.contents) {
            const i = this.parent.contents.indexOf(this);
            if (window.DEBUG && i === -1) {
                throw new Error('Renderer not found in parent contents array. Summat\'s up.');
            }

            // Replace this renderer in parent
            this.parent.contents[i] = renderer;
        }
        else {
            //console.log('REPLACE ', this.parent);
            //this.parent.content = renderer;
        }

        // If we're in the DOM, signal connected state
        if (this.status === 'dom') {
            renderer.connect && renderer.connect();
        }
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

export function StreamRenderer(parent, stream) {
    this.id      = ++meta.count;
    this.parent  = parent;
    this.content = create('text', '');
    this.stream  = stream;
    stream.pipe(this);
}

assign(StreamRenderer.prototype, PromiseRenderer.prototype, {
    render: function(value) {
        const renderer = toRenderer(this, value);
        const content  = toContent(renderer);

        this.content.stop && this.content.stop();
        this.content.replaceWith(content);
        this.content = renderer;

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

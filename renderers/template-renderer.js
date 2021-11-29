
/**
TemplateRenderer(template)

Import the `TemplateRenderer` constructor from the main module:

```js
import TemplateRenderer from 'https://stephen.band/literal/module.js';
```

The `TemplateRenderer` constructor takes a template element, or the `id` of a
template element, and creates a renderer of a clone of the template's content.
A renderer manages an asynchronous lifecycle of content renders, updating its
DOM nodes in response to changing data.

```js
const renderer = new TemplateRenderer('id');
const data     = {};

// Cue data for render then add it to the DOM
renderer
.push(data)
.then(() => document.body.append(renderer.content));
```
**/

import identify        from '../../dom/modules/identify.js';
import isTextNode      from '../../dom/modules/is-text-node.js';
import compileNode     from '../modules/compile-node.js';
import { Observer, getTarget } from '../../fn/observer/observer.js';
import stats, { meta } from './analytics.js';
import { uncue }       from './batcher.js';
import Renderer, { removeNodes, renderStopped, trigger } from './renderer.js';

const assign = Object.assign;
const cache  = {};


/*
TemplateRenderer
Descendant paths are stored in the form `"1.12.3.class"`, enabling fast
cloning of template instances without retraversing their DOMs looking for
literal attributes and text.
*/

function child(parent, index) {
    return /^[a-zA-Z]/.test(index) ?
        parent :
        parent.childNodes[index] ;
}

function getDescendant(path, root) {
    // If path is empty return root
    const p = path && path.split(/\./);
    return path ?
        p.reduce(child, root) :
        root ;
}

function isMarkerNode(node) {
    // Markers should be spaces-only else we risk unrendered content being
    // inserted into the DOM. If it's not a text node, it's not a marker
    // node because it could contain something that contains unrendered code.
    if (!isTextNode(node)) {
        return false;
    }

    const text  = node.nodeValue;
    const space = /^\s*/.exec(text);

    // If text is more than just space return false
    return space[0].length === text.length;
}

function prepareContent(content) {
    // Due to the way HTML is usually written the vast majority of templates
    // start and end with a text node, usually containing some white space
    // and new lines. The renderer uses these as delimiters for the start and
    // end of templated content – where it can. If the template does NOT start
    // or end with a text node, we insert text nodes where needed.
    const first = content.childNodes[0];
    const last  = content.childNodes[content.childNodes.length - 1];

    if (!isMarkerNode(first)) {
        content.prepend(document.createTextNode(''));
    }

    if (!isMarkerNode(last)) {
        content.append(document.createTextNode(''));
    }
}

function newRenderer(renderer) {
    // `this` is the parent renderer of the new renderer
    const node = getDescendant(renderer.path, this.content);

    // Where node is a text node we must find its context element
    const element = isTextNode(node) ?
        // If it's a direct child of template, use the template renderer's
        // element as context element
        !/\./.test(renderer.path) ? this.element :

        // Otherwise it is already inside its context element
        node.parentNode :

    // node itself is the context element for attributes
    node ;

    return new renderer.constructor(node, renderer, element);
}

export default function TemplateRenderer(template, parent) {
    // TemplateRenderer may be called with a string id or a template element
    const id = typeof template === 'string' ?
        template :
        identify(template) ;

    this.id      = ++meta.count;
    this.element = parent;

    // If the template is already compiled, clone the compiled contents to
    // this renderer and bind them to a new fragment
    if (cache[id]) {
        const template = cache[id].template;
        this.template  = template;
        this.content   = template.content ? template.content.cloneNode(true) : template.cloneNode(true) ;
        this.first     = this.content.childNodes[0];
        this.last      = this.content.childNodes[this.content.childNodes.length - 1];
        this.contents = cache[id].contents.map(newRenderer, this);
        ++stats['#' + id].template;
        ++stats.Totals.template;
        return;
    }

    template = typeof template === 'string' ?
        document.getElementById(template[0] === '#' ? template.slice(1) : template) :
        template ;

    if (window.DEBUG) {
        if (!template) {
            throw new Error('Template id="' + id + '" not found in document');
        }
        /*
        if (!template.content) {
            throw new Error('Element id="' + id + '" is not a <template> (no content fragment)');
        }
        */
    }

    /**
    .content

    A fragment that initially contains the renderer's DOM nodes. On creation of
    a renderer they are in an unrendered state. They are guaranteed to be in a
    rendered state on resolution of the first render(). The fragment may be
    inserted into the DOM at any time, at which point it will no longer contain
    the renderer's DOM nodes.
    **/
    template.content && prepareContent(template.content);

    this.template = template;
    this.content  = template.content ? template.content.cloneNode(true) : template.cloneNode(true) ;
    this.first    = this.content.childNodes[0];
    this.last     = this.content.childNodes[this.content.childNodes.length - 1];

    // Analytics (must be declared before contents)
    stats['#' + id] = { template: 1 };
    ++stats.Totals.template;

    // The options object contains information for renderer objects. It is
    // mutated as it is passed to each renderer (specifically path, name,
    // source properties). We can do this because renderer construction is
    // synchronous within a template.
    this.contents = compileNode([], { template: id, path: '' }, this.content, parent);

    cache[id] = this;
}

assign(TemplateRenderer.prototype, Renderer.prototype, {
    /**
    .push(data)
    Cues `data` to be rendered in the next render batch. Returns a promise that
    resolves when the batch is finished rendering. [Todo: this is a bit bizarre,
    perhaps implement .each().]

    The `data` object is observed for mutations, and the renderer updates it
    content until either a new data object is cued or the renderer is stopped.
    **/
    push: function(object) {
        const data = object ? getTarget(object) : null ;

        // Deduplicate. Not sure this is entirely necessary.
        if (data === this.data) {
            return Promise.reject('Attempt to render with same object as last render');
        }

        this.data = data;
        return Renderer.prototype.push.apply(this, arguments);
    },

    render: function(object) {
        //console.log(this.constructor.name + '#' + this.id + '.render()');

        if (!object) {
            // Remove all but the first node to the renderer's content fragment
            const nodes = [];
            let node = this.first;

            while (node !== this.last) {
                node = node.nextSibling;
                nodes.push(node);
            }

            this.content.append.apply(this.content, nodes);
            return nodes.length;
        }

        const data      = getTarget(object);
        const observer  = Observer(data);
        const contents = this.contents;
        var count = 0;

        // Render the contents (synchronously)
        contents.forEach((renderer) => count += renderer.render(observer));

        // If this.first is not in the content fragment, it must be in the
        // parent DOM being used as a marker. It's time for its freshly rendered
        // brethren to join it.
        if (this.content.firstChild && this.first !== this.content.firstChild) {
            this.first.after(this.content);
            ++count;
        }

        return count;
    },

    /**
    .remove()
    Removes rendered content from the DOM.
    **/
    remove: function() {
        return removeNodes(this.first, this.last);
    },

    /**
    .replaceWith()
    Removes rendered content from the DOM and inserts arguments in its place.
    **/
    replaceWith: function() {
        this.first.before.apply(this.first, arguments);
        return this.remove();
    },

    /**
    .stop()
    Stops renderer.
    **/
    stop: function() {
        uncue(this);

        if (window.DEBUG) {
            this.render = renderStopped;
        }

        // object, method, status, payload
        trigger(this, 'stop', 'done');
        return this;
    }
});

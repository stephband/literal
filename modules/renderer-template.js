
/**
TemplateRenderer(template, parameters)

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

import Stream            from '../../fn/modules/stream/stream.js';
import { Observer }      from '../../fn/observer/observer.js';
import identify          from '../../dom/modules/identify.js';
import isTextNode        from '../../dom/modules/is-text-node.js';
import compileNode       from './compile-node.js';
import removeNodes       from './remove-nodes.js';
import { cue, uncue }    from './cue.js';
import { pathSeparator } from './constants.js';

const assign = Object.assign;
const keys   = Object.keys;
const cache  = {};


/*
TemplateRenderer
Descendant paths are stored in the form `"#id 1:12:3:attribute"`, enabling fast
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
    const p = path && path.split(pathSeparator);
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

function cloneRenderer(renderer) {
    // `this` is the parent templateRenderer of the new renderer
    const node = getDescendant(renderer.path, this.content);

    //source, consts, template, path, node, name, message, parameters
    const clone = new renderer.constructor(renderer.literal, '', renderer.template, renderer.path, node, renderer.name, '', this.parameters);

    // Stop clone when template renderer stops
    this.done(clone);
    return clone;
}

export default function TemplateRenderer(template, parameters) {
    const id = identify(template) ;

    this.template   = template;
    this.parameters = parameters;

    // If the template is already compiled and cached...
    const renderer = cache[id];

    // clone it
    if (renderer) {
        this.content   = renderer.template.content ?
            renderer.template.content.cloneNode(true) :
            renderer.template.cloneNode(true) ;
        this.first     = this.content.childNodes[0];
        this.last      = this.content.childNodes[this.content.childNodes.length - 1];
        this.contents  = renderer.contents.map(cloneRenderer, this);
        return;
    }

    cache[id] = this;

    if (window.DEBUG && !template) {
        throw new Error('Template id="' + id + '" not found in document');
    }

    /**
    .content

    A fragment that initially contains the renderer's DOM nodes. On creation of
    a renderer they are in an unrendered state. They are guaranteed to be in a
    rendered state on resolution of the first render(). The fragment may be
    inserted into the DOM at any time, at which point it will no longer contain
    the renderer's DOM nodes.
    **/

    if (this.template.content) {
        prepareContent(this.template.content);
        this.content = this.template.content.cloneNode(true);
    }
    else {
        this.content = this.template.cloneNode(true) ;
    }

    this.first = this.content.childNodes[0];
    this.last  = this.content.childNodes[this.content.childNodes.length - 1];

    // Get template constants from dataset keys, where `data-name` becomes
    // available as `name` inside the template
    const consts = keys(template.dataset).join(', ');

    // compileNode(renderers, node, template, path, parameters, consts)
    this.contents = compileNode([], this.content, '#' + template.id, '', parameters, consts);

    // Stop child when template renderer stops
    this.contents.forEach((renderer) => this.done(renderer));
}

assign(TemplateRenderer.prototype, {
    push: function(object) {
        if (this.status === 'stopped') {
            throw new Error('Renderer is stopped, cannot .push() data');
        }

        const data = Observer(object) || object;
        if (this.data === data) { return; }

        this.data = data;

        // Do we actually need to cue? I mean, the push on each child renderer
        // is cue()d so why do we need to do it here?
        //
        // Well, at the moment we need to do it here because in update()
        // children are appended to the DOM synchronously around line 230. And
        // perhaps this is for the best: why cue multiple renderers when you can
        // cue just this one, after all? Hmmm.
        //cue(this);
        // Nah lets not cue here ...
        this.update();
    },

    update: function() {
        //console.log(this.constructor.name + '#' + this.id + '.render()');

        const data = this.data;

        if (!data) {
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

        // Render the contents (synchronously)
        this.mutations = 0;
        this.contents.forEach((renderer) => {
            renderer.data = data;
            this.mutations += renderer.update().mutations
        });

        // If this.first is not in the content fragment, it must be in the
        // parent DOM being used as a marker. It's time for its freshly rendered
        // brethren to join it.
        if (this.content.firstChild && this.first !== this.content.firstChild) {
            this.first.after(this.content);
            ++this.mutations;
        }

        return this;
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
        this.status = 'stopped';
        Stream.prototype.stop.apply(this);
        return this;
    },

    done: Stream.prototype.done
});

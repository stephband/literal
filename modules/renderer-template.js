
/**
TemplateRenderer(template, parameters)

Import the `TemplateRenderer` constructor:

```js
import TemplateRenderer from './literal/modules/renderer-template.js';
```

The `TemplateRenderer` constructor takes a template element (or the `id` of a
template element), clones the template's content, and returns a renderer that
renders data into the content. The renderer updates its DOM nodes in response
to changing data.

```js
const renderer = new TemplateRenderer('id');
const data     = {};

// Cue data for render then add it to the DOM
renderer
.push(data)
.then(() => document.body.append(renderer.content));
```
**/


import overload          from '../../fn/modules/overload.js';
import Stream, { stop }  from '../../fn/modules/stream/stream.js';
import create            from '../../dom/modules/create.js';
import identify          from '../../dom/modules/identify.js';
import isTextNode        from '../../dom/modules/is-text-node.js';
import { pathSeparator } from './renderer/constants.js';
import compileNode       from './renderer/compile-node.js';
import { cue, uncue }    from './renderer/cue.js';
import removeNodeRange       from './dom/remove-node-range.js';
import getNodeRange      from './dom/get-node-range.js';
import Data              from './data.js';

const assign = Object.assign;
const keys   = Object.keys;
const cache  = {};
const nodes  = [];


function dataIsNull() {
    return this.data === null;
}

/*
TemplateRenderer
Descendant paths are stored in the form `"#id 1:12:3:attribute"`, enabling fast
cloning of template instances without retraversing their DOMs looking for
literal attributes and text.
*/

function getChild(element, index) {
    return /^[a-zA-Z]/.test(index) ?
        element.getAttributeNode(index) :
        element.childNodes[index] ;
}

function getDescendant(path, root) {
    // If path is empty return root
    return path ?
        path.split(pathSeparator).reduce(getChild, root) :
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
    // and new lines. TemplateRenderer uses these as delimiters for the start
    // and end of templated content – where it can. If the template does NOT
    // start or end with a text node, we insert text nodes where needed.
    const first = content.childNodes[0];
    const last  = content.childNodes[content.childNodes.length - 1];

    if (!first || !isMarkerNode(first)) {
        content.prepend(create('text'));
    }

    if (!last || !isMarkerNode(last)) {
        content.append(create('text'));
    }
}

function cloneRenderer(renderer) {
    // `this` is the parent templateRenderer of the new renderer
    const node  = getDescendant(renderer.path, this.content);
    const clone = new renderer.constructor(renderer.literal, node, renderer.path, this.parameters, renderer.message) ;

    // Stop clone when parent template renderer stops
    this.done(clone);
    return clone;
}

export default function TemplateRenderer(template, parameters) {
    const id       = identify(template) ;
    const renderer = cache[id];

    this.parameters = parameters;
    this.template   = template.content ?
        template :
        { content: create('fragment', template.childNodes, template) } ;

    // The template is already compiled and cached. Clone and return it.
    if (renderer) {
        this.content   = renderer.template.content.cloneNode(true);
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

    prepareContent(this.template.content);

    this.content  = this.template.content.cloneNode(true);
    this.first    = this.content.childNodes[0];
    this.last     = this.content.childNodes[this.content.childNodes.length - 1];
    this.message  = '#' + id + ' - ';
    this.contents = compileNode([], this.content, '', parameters, this.message);

    // Stop child when template renderer stops
    this.contents.forEach((renderer) => this.done(renderer));
}

assign(TemplateRenderer.prototype, {
    push: function(object) {
        if (this.status === 'done') {
            throw new Error('Renderer is done, cannot .push() data');
        }

        const data = Data(object) || object;

        // Dedup
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

    update: overload(dataIsNull, {
        true: function() {
            //console.log(this.constructor.name + (this.id ? '#' + this.id : '') + '.render()');
            const data = this.data;

            // Remove all but the last node to the renderer's content fragment
            nodes.length = 0;
            let node = this.first;

            while (node !== this.last) {
                nodes.push(node);
                node = node.nextSibling;
            }

            this.content.prepend.apply(this.content, nodes);
            return nodes.length;
        },

        false: function() {
            //console.log(this.constructor.name + (this.id ? '#' + this.id : '') + '.render()');
            const data = this.data;

            // Render the contents (synchronously)
            this.mutations = this.contents.reduce((mutations, renderer) => {
                renderer.data = data;
                mutations = mutations + renderer.update().mutations;
                return mutations;
            }, 0);

            // If this.last is not in the content fragment, it must be in the
            // parent DOM being used as a marker. It's time for its freshly rendered
            // brethren to join it.
            if (this.content.lastChild && this.last !== this.content.lastChild) {
                this.last.before(this.content);
                ++this.mutations;
            }

            return this;
        }
    }),

    /**
    .remove()
    Removes rendered content from the DOM, placing it back in the
    fragment at `renderer.content`.
    **/
    remove: function() {
        // Can't remove if we're already removed
        if (this.content.lastChild === this.last) {
            return 0;
        }

        // Remove first to last and all nodes in between to .content fragment
        const nodes = getNodeRange(this.first, this.last);
        this.content.prepend.apply(this.content, nodes);
        return nodes.length;
    },

    /**
    .replaceWith()
    Removes rendered content from the DOM and inserts arguments in its place.
    **/
    replaceWith: function() {
        // Can't replace if we're removed
        if (this.content.lastChild === this.last) {
            return 0;
        }

        this.last.after.apply(this.last, arguments);
        return this.remove();
    },

    /**
    .stop()
    Stops renderer.
    **/
    stop: function() {
        uncue(this);
        stop(this);
        return this;
    },

    done: Stream.prototype.done
});

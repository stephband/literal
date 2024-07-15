
/**
Template(template, element, parameters, options)

Import the `Template` constructor:

```js
import Template from './literal/modules/template.js';
```

The `Template` constructor takes a template element (or the `id` of a
template element), clones the template's content, and returns a renderer that
renders data into the content. The renderer updates its DOM nodes in response
to changing data.

```js
const renderer = new Template('id');
const data     = {};

// Cue data for render then add it to the DOM
renderer
.push(data)
.then(() => document.body.append(renderer.content));
```
**/


import overload            from '../../fn/modules/overload.js';
import Signal              from '../../fn/modules/signal.js';
import Data                from '../../fn/modules/signal-data.js';
import create              from '../../dom/modules/create.js';
import identify            from '../../dom/modules/identify.js';
import isTextNode          from '../../dom/modules/is-text-node.js';
import { pathSeparator }   from './compile/constants.js';
import removeNodeRange     from './dom/remove-node-range.js';
import Renderer, { stats } from './renderer.js';
import getNodeRange        from './dom/get-node-range.js';
import compileNode         from './compile.js';
import { groupCollapsed, groupEnd } from './log.js';

const assign = Object.assign;
const keys   = Object.keys;
const cache  = {};
const nodes  = [];
const defaults = {};


/*
Template
Descendant paths are stored in the form `"#id>1>12>3"`, enabling fast
cloning of template instances without retraversing their DOMs looking for
literal attributes and text.
*/

function getChild(element, index) {
    return element.childNodes[index] ;
}

function getElement(path, node) {
    return path
        .split(pathSeparator)
        .reduce(getChild, node) ;
}

function isMarkerNode(node) {
    // Markers should be spaces-only else we risk unrendered content being
    // inserted into the DOM. If it's not a text node, it's not a marker
    // node because it could contain something that contains unrendered code.
    if (!isTextNode(node)) return false;

    const text  = node.nodeValue;
    const space = /^\s*/.exec(text);

    // If text is more than just space return false
    return space[0].length === text.length;
}

function prepareContent(content) {
    // Due to the way HTML is usually written the vast majority of templates
    // start and end with a text node, usually containing some white space
    // and new lines. Template uses these as delimiters for the start
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

function compileTemplate(template, id, options) {
    const content = template.content
        || create('fragment', template.childNodes, template) ;

    if (window.DEBUG) { groupCollapsed('compile', '#' + id, 'yellow'); }
    prepareContent(content);
    // compile(fragment, message, options)
    const targets = compileNode(content, '#' + id, options);
    if (window.DEBUG) { groupEnd(); }

    return { content, targets };
}

export default class Template {
    // Data signal
    #data;

    constructor(template, parent = template.parentElement, parameters = {}, data, options = defaults) {
        // A literal template may be created from inside a TextRenderer render
        // evaluation via ${ include(...) } and for this reason we must avoid
        // accessing any signals outside of a Signal.evaluate(), or they are
        // registered as dependents of the TextRenderer.

        const id = identify(template) ;

        const compiled = cache[id] ||
            (cache[id] = compileTemplate(template, id, {
                nostrict: options.nostrict || (template.hasAttribute && template.hasAttribute('nostrict'))
            }));

        const content = compiled.content.cloneNode(true);

        this.content    = content;
        this.element    = parent;
        this.parameters = parameters;
        this.first      = content.childNodes[0];
        this.last       = content.childNodes[content.childNodes.length - 1];
        this.#data      = Signal.of(Data.of(data));
        this.contents   = compiled.targets
            // We must find targets in cloned content
            .map(this.#toRendererParams, this)
            // before we create renderers for them, as renderers may mutate the DOM
            .map(this.#toRenderer, this);
    }

    #toRendererParams(target) {
        const { path, name, fn } = target;

        // Where `.path` exists find the element at the end of the path
        const element = path ? getElement(path, this.content) : this.element ;

        // Text renderer expects a text node that must always come from the
        // cloned content fragment
        const n = typeof name === 'number' ?
            path ? element.childNodes[name] :
            this.content.childNodes[name] :
        name;

        // Parameters for Renderer.create():
        // signal, fn, parameters, element, nameOrNode
        return [this.#data, fn, this.parameters, element, n];
    }

    #toRenderer(parameters) {
        const renderer = Renderer.create(...parameters);
        this.done(renderer);
        return renderer;
    }

    push(object) {
        if (this.status === 'done') throw new Error('Renderer is done, cannot .push() data');

        // Causes renderers to .invalidate() because they are dependent on
        // this.#data signal
        this.#data.value = Data.of(object);

        // If object is null remove all but the last node to the renderer's
        // content fragment
        if (object === null) {
            nodes.length = 0;
            let node = this.first;

            while (node !== this.last) {
                nodes.push(node);
                node = node.nextSibling;
            }

            this.content.prepend.apply(this.content, nodes);
            stats.remove += nodes.length;
            return this;
        }

        // If there is a content in the content fragment and this.last is not in
        // the content fragment, it must be in the parent DOM being used as a
        // marker. It's time for its freshly rendered brethren to join it.
        if (this.content.lastChild && this.last !== this.content.lastChild) {
            this.last.before(this.content);
            stats.add += 1;
        }

        return this;
    }

    /**
    .remove()
    Removes rendered content from the DOM, placing it back in the
    fragment at `renderer.content`.
    **/
    remove() {
//console.log('Template.remove()');
        // Can't remove if we're already removed
        if (this.content.lastChild === this.last) {
            return 0;
        }

        // Remove first to last and all nodes in between to .content fragment
        const nodes = getNodeRange(this.first, this.last);
        this.content.prepend.apply(this.content, nodes);
        stats.remove += nodes.length;
        return nodes.length;
    }

    /**
    .replaceWith()
    Removes rendered content from the DOM and inserts arguments in its place.
    **/
    replaceWith() {
//console.log('Template.replaceWith()');
        // Can't replace if we're removed
        if (this.content.lastChild === this.last) {
            return 0;
        }

        this.last.after.apply(this.last, arguments);
        stats.add += arguments.length;
        return this.remove();
    }

    /**
    .stop()
    Stops renderer.
    **/
    stop = Renderer.prototype.stop;

    /**
    .done(object)
    Registers `object.stop()` to be called when this renderer is stopped.
    **/
    done = Renderer.prototype.done;
}

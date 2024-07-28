
/**
Template(template, element, consts, options)

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
import Data                from '../../fn/modules/data.js';
import create              from '../../dom/modules/create.js';
import identify            from '../../dom/modules/identify.js';
import { pathSeparator }   from './compile/constants.js';
import Renderer, { stats } from './renderer/renderer.js';
import compileNode         from './compile.js';
import { groupCollapsed, groupEnd } from './log.js';

const assign = Object.assign;
const keys   = Object.keys;
const cache  = {};
const nodes  = [];
const defaults = {};


/*
Literal
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

function removeRange(first, last, fragment) {
    if (window.DEBUG && first.parentNode !== last.parentNode) {
        throw new Error('first and last not children of same parent')
    }

    if (first === last) {
        fragment.prepend(last);
        if (window.DEBUG) ++stats.remove;
        return;
    }

    // Select range of nodes managed by this template
    const range = new Range();
    range.setStartBefore(first);
    range.setEndAfter(last);

    // Remove range content from DOM
    const dom = range.extractContents();
    if (window.DEBUG) ++stats.remove;

    // And place into this.content fragment
    fragment.appendChild(dom);
}

export default class Literal {
    static compile(identifier, fragment, options) {
        if(cache[identifier]) return cache[identifier];

        if (window.DEBUG) {
            groupCollapsed('compile', identifier, 'yellow');
            cache[identifier] = compileNode(fragment, options, identifier);
            groupEnd();
            return cache[identifier];
        }

        return cache[identifier] = compileNode(fragment, options);
    }

    static isTemplate(object) {
        return object instanceof Literal;
    }

    static fromHTML(html) {
        return Literal.fromTemplate(create('template', html));
    }

    static fromFragment(identifier, fragment, element, consts = {}, data, options) {
        const compiled = Literal.compile(identifier, fragment, options);

        // fragment, targets, element, consts, data, options
        return new Literal(fragment.cloneNode(true), compiled, element, consts, data, options);
    }

    static fromTemplate(template, element, consts = {}, data) {
        const id       = identify(template, 'literal-');
        const fragment = template.content;
        const options  = {
            nostrict: template.hasAttribute && template.hasAttribute('nostrict')
        };

        return Literal.fromFragment('#' + id, fragment, element, consts, data, options);
    }

    #first;
    #last;
    #data;

    // fragment, targets, element, consts, data, options
    constructor(fragment, targets, parent = template.parentElement, consts = {}, data, options = defaults) {
        const children = fragment.childNodes;

        // The first node may change. The last node is always the last node.
        this.#data    = Signal.of(Data.objectOf(data));
        this.#first   = children[0];
        this.#last    = children[children.length - 1];
        this.content  = fragment;
        this.element  = parent;
        this.consts   = consts;
        this.contents = targets
            // We must find targets in cloned content
            .map(this.#toCompiled, this)
            // before we create renderers for them, as renderers may mutate the DOM
            .map(this.#toRenderer, this);
    }

    #toCompiled(compiled) {
        const { path, name } = compiled;

        // Where `.path` exists find the element at the end of the path
        const element = path ? getElement(path, this.content) : this.element ;

        // Text renderer expects a text node that must always come from the
        // cloned content fragment
        const node = typeof name === 'number' ?
            path ? element.childNodes[name] :
            this.content.childNodes[name] :
        name;

        // Parameters for new Renderer()
        return { element, node, compiled };
    }

    #toRenderer({ element, node, compiled }) {
        const { Renderer, literal } = compiled;
        const renderer = new Renderer(this.#data, literal, this.consts, element, node, compiled);
        this.done(renderer);
        return renderer;
    }

    /*
    .firstNode
    .lastNode
    */

    get firstNode() {
        // Has #first become the last node of a TextRenderer? Note that it is
        // perfectly possible to have a template with no content renderers.
        const renderer = this.contents && this.contents[0];
        return renderer && this.#first === renderer.lastNode ?
            renderer.firstNode :
            this.#first ;
    }

    get lastNode() {
        return this.#last;
    }

    /**
    .data
    Read-only property exposing (literal's `data` proxy of) the currently
    rendered object. This is the same object available as `data` inside a
    literal template. Setting properties on this object causes the DOM to update.
    **/

    get data() {
        const data = this.#data.value;
        return Data.of(data) || data;
    }

    /**
    .push(object)
    Rerenders and binds the DOM to (literal's `data` proxy of) `object`. This is
    the same object available as `data` inside the template.
    **/

    push(object) {
        if (this.status === 'done') throw new Error('Renderer is done, cannot .push() data');

        // Make sure we have the raw object
        object = Data.objectOf(object);

        // Dedup
        if (this.#data.value === object) return;

        // If we are coming out of sleep put content back in the DOM
        if (this.#data.value === null && object !== null) {
            this.lastNode.before(this.content);
        }

        // Causes renderers dependent on this signal to .invalidate()
        this.#data.value = object;

        // If object is null put template to sleep: remove all but the last node
        // to the content fragment and blank out the last text node, which we
        // leave in the DOM to serve as a marker for reentry of rendered content
        if (object === null) {
            if (this.firstNode !== this.lastNode) {
                removeRange(this.firstNode, this.lastNode.previousSibling, this.content);
            }

            this.lastNode.textContent = '';
        }

        return this.content;
    }

    /**
    .before()
    **/

    before() {
        const first = this.firstNode;
        const last  = this.lastNode;

        // Last node is not in the DOM
        if (this.content.lastChild === last) {
            throw new Error('Illegal Literal.before() – template is not in the DOM');
        }

        // First node is not in the DOM
        return this.content.firstChild === first ?
            last.before.apply(last, arguments) :
            first.before.apply(first, arguments) ;
    }

    /**
    .remove()
    Removes rendered content from the DOM, placing it back in the
    `renderer.content` fragment.
    **/

    remove() {
        const first = this.firstNode;
        const last  = this.lastNode;

        // Check if we are in the DOM. Can't remove if we're not in the DOM.
        if (this.content.lastChild === last) {
            return;
        }

        if (this.content.firstChild === first) {
            this.content.appendChild(last);
            return;
        }

        removeRange(first, last, this.content);
    }
}

assign(Literal.prototype, {
    /**
    .stop()
    Stops renderer.
    **/

    stop: Renderer.prototype.stop,

    /**
    .done(object)
    Registers `object.stop()` to be called when this renderer is stopped.
    **/

    done: Renderer.prototype.done
});

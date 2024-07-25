
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
import Data                from '../../fn/modules/data.js';
import create              from '../../dom/modules/create.js';
import identify            from '../../dom/modules/identify.js';
import { pathSeparator }   from './compile/constants.js';
import Renderer, { stats } from './renderer.js';
import compileNode         from './compile.js';
import { groupCollapsed, groupEnd } from './log.js';

const assign = Object.assign;
const keys   = Object.keys;
const cache  = {};
const nodes  = [];
const defaults = {};


/*
LiteralRenderer
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

function compileFragment(id, fragment, options) {
    //const content = template.content || create('fragment', template.childNodes, template) ;

    let targets;
    if (window.DEBUG) {
        groupCollapsed('compile', '#' + id, 'yellow');
        targets = compileNode(fragment, options, { template: '#' + id });
        groupEnd();
    }
    else {
        targets = compileNode(fragment, options);
    }

    return { id, fragment, targets };
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

export class LiteralDOM {
    #first;
    #last;
    #data;

    constructor(content, targets, parent = template.parentElement, parameters = {}, data, options = defaults) {
        const children  = content.childNodes;

        // The first node may change. The last node is always the last node.
        this.#data      = Signal.of(Data.of(data));
        this.#first     = children[0];
        this.#last      = children[children.length - 1];

        this.content    = content;
        this.element    = parent;
        this.parameters = parameters;
        this.contents   = targets
            // We must find targets in cloned content
            .map(this.#toRendererParams, this)
            // before we create renderers for them, as renderers may mutate the DOM
            .map(this.#toRenderer, this);
    }

    #toRendererParams(target) {
        const { path, name, literal, message, template } = target;

        // Where `.path` exists find the element at the end of the path
        const element = path ? getElement(path, this.content) : this.element ;

        // Text renderer expects a text node that must always come from the
        // cloned content fragment
        const n = typeof name === 'number' ?
            path ? element.childNodes[name] :
            this.content.childNodes[name] :
        name;

        // Parameters for Renderer.create():
        // signal, literal, parameters, element, nameOrNode
        return [this.#data, literal, this.parameters, element, n, target];
    }

    #toRenderer(parameters) {
        const renderer = Renderer.create(...parameters);
        this.done(renderer);
        return renderer;
    }

    /*
    template.firstNode
    template.lastNode
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

    /*
    .push()
    */

    push(object) {
        if (this.status === 'done') throw new Error('Renderer is done, cannot .push() data');

        // Dedup
        if (this.#data === object) return;

        // If we are coming out of sleep put content back in the DOM
        if (this.#data === null && object !== null) {
            this.lastNode.before(this.content);
        }

        // Causes renderers to .invalidate() because they are dependent on
        // this.#data signal
        this.#data.value = Data.of(object);

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
            throw new Error('Illegal LiteralRenderer.before() – template is not in the DOM');
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

assign(LiteralDOM.prototype, {
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

export default class LiteralRenderer extends LiteralDOM {
    static isTemplate(object) {
        return object instanceof LiteralRenderer;
    }

    static of(html) {
        const template = create('template', html);
        return new LiteralRenderer(template);
    }

    static compile(fragment, options, debug) {
        let targets;

        if (window.DEBUG) {
            groupCollapsed('compile', debug.template, 'yellow');
            targets = compileNode(fragment, options, debug);
            groupEnd();
        }
        else {
            targets = compileNode(fragment, options);
        }

        return targets;
    }

    constructor(template, parent = template.parentElement, parameters = {}, data, o = defaults) {
        const id       = identify(template, 'literal-');
        const options  = assign({}, o, {
            nostrict: template.hasAttribute && template.hasAttribute('nostrict')
        });

        const compiled = LiteralRenderer.compile(template.content, options, { template: '#' + id });

        super(template.content.cloneNode(true), compiled, parent, parameters, data, options);
    }
}

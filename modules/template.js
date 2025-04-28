
import overload            from 'fn/overload.js';
import Data                from 'fn/data.js';
import Signal              from 'fn/signal.js';
import Stopable            from 'fn/stream/stopable.js';
import create              from 'dom/create.js';
import identify            from 'dom/identify.js';
import { pathSeparator }   from './compile/constants.js';
import Renderer, { stats } from './renderer/renderer.js';
import compileNode         from './compile/compile-node.js';
import { groupCollapsed, groupEnd } from './log.js';

const assign   = Object.assign;
const keys     = Object.keys;
export const cache = {};
const nodes    = [];
const defaults = {};

let id = 0;


/*
Template contents
Descendant paths are stored in the form `"#id>1>12>3"`, enabling fast cloning of
Literal instances without re-traversing their DOMs looking for template tags.
*/

function getChild(element, index) {
    return element.childNodes[index];
}

function getElement(path, node) {
    return path.split(pathSeparator).reduce(getChild, node);
}


/*
Template context
A template may be rendered into an element that requires something other than
the standard HTML context, ie SVG elements, in which case the fragment we pass
to Literal should not be `template.content` but a fragment with an SVG context.
*/

function getContextFragment(element, template) {
    if (element instanceof SVGElement) {
        const range = document.createRange();
        const html  = template.innerHTML;

        // An outer <svg> will not act as the correct context, I suspect because
        // it is itself an HTML element. Not entirely clear, but whatever, we
        // must use a <g> or <defs>, either of which permit the same content as
        // an <svg> context.
        if (element.ownerSVGElement === null) {
            // Create a <defs>, append it, use it as context
            const defs = create('defs');
            element.appendChild(defs);
            range.selectNode(defs);

            // Create fragment, remove the <defs>, return the fragment
            const fragment = range.createContextualFragment(html);
            range.deleteContents();
            return fragment;
        }

        // Use element as context to create fragment
        range.selectNode(element);
        return range.createContextualFragment(html);
    }

    // Use the template's content fragment directly
    return template.content.cloneNode(true);
}

/*
DOM management
*/

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



/**
Template(id, fragment, options)
TODO. Currently only used by Literal.compileHTML, should be inveigled
into everything.
**/

class Template {
    constructor(id, fragment, options = {}) {
        this.id       = id;
        this.content  = fragment;
        this.contents = compileNode([], fragment, '', options, id);
        cache[id] = this;
    }

    render(element, consts, data) {
        const fragment = getContextFragment(element, this);
        return new Literal(fragment, this.contents, element, consts, data);
    }
}


/**
Literal(fragment, targets, element, consts, data, options)
**/

export default class Literal extends Renderer {
    /**
    Literal.compile(identifier, fragment, options)
    **/
    static compile(id, fragment, options = {}) {
        if(cache[id]) return cache[id];

        if (window.DEBUG) {
            groupCollapsed('compile', id, 'yellow');
            cache[id] = compileNode([], fragment, '', options, id);
            groupEnd();
            return cache[id];
        }

        // compileNode(renderers, fragment, path, options, debug_string)
        return cache[id] = compileNode([], fragment, '', options, id);
    }

    // EXPERIMENTAL Needed for Soundstage custom elements
    static compileHTML(id, html, options) {
        const template = create('template', html);
        const fragment = template.content;
        return new Template(id, fragment, options);
    }

    /**
    Literal.fromFragment(identifier, fragment, element, consts, data)
    **/
    static fromFragment(identifier, fragment, element, consts = {}, data, options) {
        const renderers = Literal.compile(identifier, fragment, options);
        return new Literal(fragment.cloneNode(true), renderers, element, consts, data, options);
    }

    /**
    Literal.fromTemplate(template, element, consts, data)
    **/
    static fromTemplate(template, element, consts = {}, data) {
        const id        = identify(template, 'literal-');
        const options   = { nostrict: template.hasAttribute && template.hasAttribute('nostrict') };
        // Compile before cloning because where template has compile errors they
        // are inserted into the content and should be cloned
        const renderers = Literal.compile(id, template.content, options);
        const fragment  = getContextFragment(element, template);

        return new Literal(fragment, renderers, element, consts, data);
    }

    /**
    Literal.fromHTML(html, element, consts, data)
    *
    static fromHTML(html, element, consts, data, options = {}) {
        // TODO handle context fragment, we should be able to make one from html
        // string without first making a template?
        const template  = create('template', html);
        const renderers = Literal.compile(html, template.content, options);
        return new Literal(template.content, renderers, element, consts, data);
    }
    */

    #data;
    #first;
    #last;

    constructor(fragment, targets, parent, consts = {}, data) {
        const children = fragment.childNodes;

        // Defines .element, .consts
        super(null, null, assign({}, consts, { id: 'id-' + (++id) }), parent);

        // The first node may change. The last node is always the last node.
        this.#data    = Signal.of(Data.objectOf(data));
        this.#first   = children[0];
        this.#last    = children[children.length - 1];
        this.content  = fragment;
        this.contents = targets
            // We must find targets in cloned content
            .map(this.#toTemplate, this)
            // before we create renderers for them, as renderers may mutate the DOM
            .map(this.#toRenderer, this);
    }

    #toTemplate(compiled) {
        const { path, name } = compiled;

        // Where `.path` exists find the element at the end of the path
        const element = path ? getElement(path, this.content) : this.element ;

        // Text renderer expects a text node that must always come from the
        // cloned content fragment
        const node = typeof name === 'number' ?
            path ? element.childNodes[name] :
            this.content.childNodes[name] :
        name;

        if (window.DEBUG && !node) throw new Error('Literal – node ' + name + ' not found in template');

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
    literal template. Setting properties on this object causes re-evaluation and
    possible re-render of the template contents.
    **/
    get data() {
        const data = this.#data.value;
        return Data.of(data) || data;
    }

    // This isn't really a render signal
    evaluate() {}
    invalidate() {}

    /**
    .push(object)
    Re-renders and binds the DOM to (literal's `data` proxy of) `object`.
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
    Removes rendered content from the DOM and places it back in the `.content`
    fragment.
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

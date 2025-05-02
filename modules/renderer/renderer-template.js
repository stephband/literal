
import Data        from 'fn/data.js';
import removeRange from '../dom/remove-range.js';
import Renderer    from './renderer.js';

const assign = Object.assign;
const ids = {};

export default class TemplateRenderer extends Renderer {
    #first;
    #last;

    constructor(fragment, renderers, parameters, element, templateId) {
        if (!ids[templateId]) ids[templateId] = 0;

        // Defines .element, .consts
        super(() => {}, assign({}, parameters, {
            element,
            include: (template, fn, data) => this.include(template, fn, data),
            //print:   (...args) => print(this, ...args)
        }));

        this.id        = templateId + '-' + (++ids[templateId]);
        this.fragment  = fragment;
        this.renderers = renderers;

        // The first node may change. The last node is always the last node.
        const children = fragment.childNodes;
        this.#first = children[0];
        this.#last  = children[children.length - 1];
    }

    static from(identifier, element, parameters) {
        return Template
        .get(identifier)
        .createRenderer(element, parameters, data);
    }

    /*
    .firstNode
    .lastNode
    */
    get firstNode() {
        // Has #first become the last node of a TextRenderer? Note that it is
        // perfectly possible to have a template with no content renderers.
        const renderer = this.renderers && this.renderers[0];
        return renderer && this.#first === renderer.lastNode ?
            renderer.firstNode :
            this.#first ;
    }

    get lastNode() {
        return this.#last;
    }

    /**
    .before()
    **/
    before() {
        const first = this.firstNode;
        const last  = this.lastNode;

        // Last node is not in the DOM
        if (this.fragment.lastChild === last) {
            throw new Error('Illegal Literal.before() – template is not in the DOM');
        }

        // First node is not in the DOM
        return this.fragment.firstChild === first ?
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
        if (this.fragment.lastChild === last) {
            return;
        }

        if (this.fragment.firstChild === first) {
            this.fragment.appendChild(last);
            return;
        }

        const fragment = removeRange(first, last);
        this.fragment.appendChild(fragment);
    }
}

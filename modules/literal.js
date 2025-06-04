
import Data        from 'fn/data.js';
import Signal      from 'fn/signal.js';
import create      from 'dom/create.js';
import removeRange from './dom/remove-range.js';
import { pathSeparator } from './compile/constants.js';
import Template    from './template.js';


const assign = Object.assign;
const define = Object.defineProperties;
const ids    = {};


/*
Template contents
Descendant paths are stored in the form `"#id>1>12>3"`, enabling fast cloning of
Literal instances without re-traversing their DOMs looking for template tags.
*/

function getChild(element, index) {
    return element.childNodes[index];
}

function getElement(path, node) {
    return path
    .split(pathSeparator)
    .reduce(getChild, node);
}


/*
Template context
A template may be rendered into an element that requires something other than
the standard HTML context, ie SVG elements, in which case the fragment we pass
to Literal should not be `template.content` but a fragment with an SVG context.
*/

function getContextFragment(template, element) {
    if (element && element instanceof SVGElement) {
        const range = document.createRange();
        const html = template.innerHTML;

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

function toTemplate(compiled) {
    const { fragment, parameters } = this;
    const { path, name } = compiled;

    // Where `.path` exists find the element at the end of the path
    const element = path ? getElement(path, fragment) : parameters.element ;

    // Text renderer expects a text node that must always come from the
    // cloned content fragment
    const node =
        typeof name === 'number' ?
            path ? element.childNodes[name] :
            fragment.childNodes[name] :
        name;

    if (window.DEBUG && !node) throw new Error('Literal – node ' + name + ' not found in template');

    // Parameters for new Renderer()
    return { element, node, compiled };
}

function toRenderer({ element, node, compiled }) {
    const { parameters } = this;
    const { Renderer, literal } = compiled;
    return new Renderer(literal, parameters, element, node, compiled);
}

function stop(renderer) {
    renderer.stop();
}


/**
Literal(template, data, parameters)
**/

export default class Literal {
    #first;

    constructor(template, object, parameters = {}) {
        // Expose data in order to perform include comparisons
        this.data = Data.of(object);
        // Expose template id in order to perform include comparisons
        this.template = template;
        // Make fragment from element context where necessary
        this.fragment = getContextFragment(template, parameters.element);
        // Assemble parameters
        this.parameters = assign({}, parameters, {
            data: this.data,
            DATA: Data.objectOf(object)
        });

        const children = this.fragment.childNodes;
        // The first node may change
        this.#first = children[0];
        // The last node is always the last node
        this.lastNode = children[children.length - 1];
        // Create renderers array
        this.renderers = template.compiled
            // We must find targets in cloned content
            .map(toTemplate, this)
            // before we create renderers for them, renderers may mutate the DOM
            .map(toRenderer, this);
    }

    /** .firstNode **/
    /** .lastNode **/
    get firstNode() {
        // Has #first become the last node of a TextRenderer? Note that it is
        // perfectly possible to have a template with no content renderers.
        const renderer = this.renderers && this.renderers[0];
        return renderer && this.#first === renderer.lastNode ?
            renderer.firstNode :
            this.#first ;
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

    /**
    .stop()
    **/
    stop() {
        this.renderers.forEach(stop);
        return this;
    }

    /**
    Literal.create(identifier, element, parameters)
    **/
    static create(identifier, data, parameters) {
        // Assume identifier is of the form `#id`
        const element = document.getElementById(identifier.slice(1));
        //const fragment = element.content;
        //const options  = { nostrict: element.hasAttribute && element.hasAttribute('nostrict') };
        //const template = new Template(identifier, fragment, options, element);
        const template = Template.fromTemplate(element);
        return new Literal(template, data, parameters);
    }

    /**
    Literal.fromFragment(fragment, element, parameters, options)
    **/
    static fromFragment(fragment, data, parameters, options) {
        const template = Template.fromFragment(identifier, fragment, options);
        return new Literal(template, data, parameters);
    }

    /**
    Literal.fromHTML(html, element, options, parameters)
    **/
    static fromHTML(html, data, parameters, options) {
        const template = Template.fromHTML(identifier, html, options);
        return new Literal(template, data, parameters);
    }

    /**
    Literal.fromTemplate(template, data, parameters, options)
    **/
    static fromTemplate(element, data, parameters, options) {
        const template = Template.fromTemplate(element, options);
        return new Literal(template, data, parameters);
    }

    /**
    Literal.render(identifier, data, element)
    Returns a rendered (or about-to-be-rendered-on-the-next-frame) fragment
    from template identified by `identifier`.
    **/
    static render(id, data, element) {
        const literal = Literal.create(id, data, { element });
        return literal.fragment;
    }
}

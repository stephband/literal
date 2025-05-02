
import Data        from 'fn/data.js';
import create      from 'dom/create.js';
import identify    from 'dom/identify.js';
import compileNode from './compile/compile-node.js';
import Renderer    from './renderer/renderer-template.js';
import { pathSeparator } from './compile/constants.js';


const assign = Object.assign;
const cache  = {};


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

function toTemplate(compiled) {
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

function toRenderer({ element, node, compiled }) {
    const { Renderer, literal } = compiled;
    return new Renderer(literal, this.parameters, element, node, compiled);
}


/**
Template(id, fragment, options)
Parses `fragment` for literal tags and creates an object that serves as a
factory for creating renderers of the template via `template.createRenderer()`.
The template is cached against `id`, further calls with the same id return the
same template.
**/
export default class Template {
    constructor(id, fragment, options = {}) {
        if (cache[id]) return cache[id];
        this.id       = id;
        this.content  = fragment;
        this.compiled = compileNode([], fragment, '', options, id);
        cache[id] = this;
    }

    /**
    .createRenderer(element, data, parameters)
    **/
    createRenderer(element, data, parameters = {}) {
        const fragment = getContextFragment(element, this);

        // TEMP. Do parameters differently
        this.parameters = assign({}, parameters, {
            data: Data.of(data),
            DATA: Data.objectOf(data)
        });

        const renderers = this.compiled
            // We must find targets in cloned content
            .map(toTemplate, this)
            // before we create renderers for them, as renderers may mutate the DOM
            .map(toRenderer, this) ;

        return new Renderer(fragment, renderers, parameters, element, this);
    }

    /**
    Template.get(id)
    **/
    static get(id) {
        if (cache[id]) return cache[id];
        // Assume id is of the form `#id`
        const template = document.getElementById(id.slice(1));
        const options  = { nostrict: template.hasAttribute && template.hasAttribute('nostrict') };
        return new Template(id, template.content, options);
    }

    /**
    Template.fromHTML(id, html, options)
    **/
    static fromHTML(id, html, options = {}) {
        if (cache[id]) throw new Error('Template.fromHTML() id "' + id + '" already registered');
        const template = create('template', html);
        const fragment = template.content;
        return new Template(id, fragment, options);
    }

    /**
    Template.fromFragment(id, fragment, options)
    **/
    static fromFragment(id, fragment, options = {}) {
        if (cache[id]) throw new Error('Template.fromFragment() id "' + id + '" already registered');
        return new Template(id, fragment, options);
    }

    /**
    Template.fromTemplate(template)
    **/
    static fromTemplate(template) {
        const id = '#' + identify(template, 'literal-');
        const options = { nostrict: template.hasAttribute && template.hasAttribute('nostrict') };
        return new Template(id, template.content, options);
    }
}

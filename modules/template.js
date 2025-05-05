
import create      from 'dom/create.js';
import identify    from 'dom/identify.js';
import compileNode from './compile/compile-node.js';


const assign = Object.assign;
const cache  = {};


/**
Template(id, fragment, options)
Parses `fragment` for literal tags and creates an object that serves as a
factory for creating renderers of the template. This object is cached against
`id`, further calls with the same id return the same object.
**/

export default class Template {
    constructor(id, fragment, options = {}) {
        // If cached against id, return cached instance
        if (cache[id]) return cache[id];

        this.id       = id;
        this.content  = fragment;
        this.compiled = compileNode([], fragment, '', options, id);

        // Cache template
        cache[id] = this;
    }

    get innerHTML() {
        // Meh. (TODO test if this actually works)
        const template = create('template', { children: [this.content] });
        return template.innerHTML;
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
        const options = {
            nostrict: template.hasAttribute && template.hasAttribute('nostrict')
        };

        return new Template(id, template.content, options);
    }
}

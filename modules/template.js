
import id          from 'fn/id.js';
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

export default class Template extends id {
    constructor(id, fragment, options = {}) {
        // If cached against id, return cached instance
        if (cache[id]) return cache[id];

        // Set 4th argument up as this, allowing this to be a DOM template
        super(arguments[3]);

        // Identifier is a cache key, in the case of a template in the DOM it is
        // its fragment identifier, it may be a url or anything else
        this.identifier = id;
        this.compiled   = compileNode([], fragment, '', options, id);
        if (!this.content) this.content = fragment;

        // Cache template
        cache[id] = this;
    }

    get innerHTML() {
        // Meh. (TODO test if this actually works)
        const template = create('template', { children: [this.content] });
        return template.innerHTML;
    }

    /**
    Template.fromHTML(id, html, options)
    **/
    static fromHTML(id, html, options = {}) {
        if (cache[id]) throw new Error('Template.fromHTML() id "' + id + '" already registered');
        const template = create('template', html);
        const fragment = template.content;
        return new Template(id, fragment, options, template);
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
    static fromTemplate(template, settings) {
        const identifier = '#' + identify(template, 'literal-');
        const consts = template.getAttribute('consts');
        const options = assign({}, settings, {
            nostrict: template.hasAttribute ?
                template.hasAttribute('nostrict') :
                undefined,
            consts: consts ?
                consts.trim().split(/\s*[\s,]\s*/) :
                undefined
        });

        return new Template(identifier, template.content, options, template);
    }
}

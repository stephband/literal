
import compileNode from './compile-node.js';
import Observer    from './observer.js';
import nothing     from '../../fn/modules/nothing.js';
import identify    from '../../dom/modules/identify.js';
import log         from './log.js';

const DEBUG  = window.DEBUG === true || window.DEBUG && window.DEBUG.includes('literal');

const assign = Object.assign;
const cache  = {};

function add(a, b) {
    return b + a;
}

function not0(value) {
    return value !== 0;
}

function logCounts(counts) {
    const count = counts.reduce(add, 0);
    if (count === 0) { return; }
    log('mutate ', counts.reduce(add, 0), '#ff7246');
}

/*
TemplateRenderer
Descendant paths are stored in the form `"1.12.3.class"`. This enables fast 
cloning of template instances without retraversing their DOMs looking for 
literal attributes and text.
*/

function child(parent, index) {
    return /^[a-zA-Z]/.test(index) ?
        parent :
        parent.childNodes[index] ;
}

function getDescendant(path, root) {
    const p = path.split(/\./);
    return p.reduce(child, root);
}

function toRenderer(renderer) {
    // Create new renderer from old with reference to a new node, where `this` 
    // is the new fragment
    return new renderer.constructor(
        renderer.fn, 
        renderer.path, 
        getDescendant(renderer.path, this),
        renderer.name,
        renderer.set
    );
}

function empty(renderer) {
    const rendered = renderer.rendered;

    if (!rendered) {
        renderer.rendered = {};
        return;
    }

    let key;
    for (key in rendered) {
        rendered[key] = undefined;
    }
}

function render(renderer, observer, data) {
    empty(renderer);

    const gets     = Observer.gets(observer, (name, value) => renderer.rendered[name] = true);
    const promise  = renderer.render(observer, data);

    // We may only collect synchronous gets – other templates may use 
    // this data object while we are promising and we don't want to
    // include their gets by stopping on .then(). Stop now. If we want to
    // fix this, making a proxy per template instance would be the way to go.
    gets.stop();

    return promise;
}

export default function TemplateRenderer(template) {
    // TemplateRenderer may be called with a string id or a template element
    const id = typeof template === 'string' ?
        template :
        identify(template) ;

    // If the template is already compiled, clone the compiled consts and 
    // renderers to this renderer and bind them to a new fragment
    if (cache[id]) {
        this.consts    = cache[id].consts;
        this.content   = cache[id].content;
        this.fragment  = cache[id].content.cloneNode(true);
        this.renderers = cache[id].renderers.map(toRenderer, this.fragment);
        this.sets      = nothing;
        return;
    }

    template = typeof template === 'string' ?
        document.getElementById(template) :
        template ;

    if (DEBUG) {
        if (!template) {
            throw new Error('Template id="' + id + '" not found in document');
        }
        
        if (!template.content) {
            throw new Error('Element id="' + id + '" is not a <template> (no content fragment)');
        }
        
        if (template.dataset.data !== undefined) {
            log('render', 'data-data attribute will be ignored', 'red');
        }
    }

    // Pick up const names from data-name attributes, such that the attribute 
    // data-hello makes the const ${ hello } available inside the template.
    this.consts    = template.dataset ? Object.keys(template.dataset) : nothing ;
    this.content   = template.content;
    this.fragment  = template.content.cloneNode(true);
    this.renderers = compileNode([], this.consts.join(', '), '', this.fragment);
    this.sets      = nothing;

    cache[id] = this;
}

assign(TemplateRenderer.prototype, {
    // Default data is an empty object
    render: function(object = {}) {
        const data = Observer.target(object);

        // Deduplicate. Not sure this is entirely necessary.
        if (data === this.data) {
            return this.fragment;
        }

        this.data = data;

        const observer  = Observer(data);
        const renderers = this.renderers;

        this.sets.stop();
        this.sets = observer ?
            Observer.sets(observer, (name, value) => {
                // If the last render did not access this name assume there 
                // is no need to render. Eh? Is this right?
                const renders = renderers.map((renderer) => (
                    renderer.rendered[name] ?
                        render(renderer, observer, data) :
                        0
                ));

                // Quick out if there were no renders performed
                if (!renders.find(not0)) {
                    return;
                }

                Promise.all(renders).then(logCounts);
            }) :    
            nothing ;

        return Promise
        .all(renderers.map((renderer) => render(renderer, observer, data)))
        .then((counts) => {
            logCounts(counts);
            return this.fragment;
        });
    } 
});

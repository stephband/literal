   
import noop        from '../../../fn/modules/noop.js';
import nothing     from '../../../fn/modules/nothing.js';
import identify    from '../../../dom/modules/identify.js';
import isTextNode  from '../../../dom/modules/is-text-node.js';
import compileNode from '../compile-node.js';
import Observer    from '../observer.js';
import log         from '../log.js';

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

function empty(renderer) {
    const paths = renderer.paths;

    if (!paths) {
        renderer.paths = {};
        return;
    }

    let key;
    for (key in paths) {
        paths[key] = undefined;
    }
}

function render(renderer, observer, data) {
    empty(renderer);

    const gets    = Observer.gets(observer, (name, value) => renderer.paths[name] = true);
    const promise = renderer.render(observer, data);

    // We may only collect synchronous gets – other templates may use 
    // this data object while we are promising and we don't want to
    // include their gets by stopping on .then(). Stop now. If we want to
    // fix this, making a proxy per template instance would be the way to go.
    gets.stop();
    //console.log(Object.keys(renderer.paths));
    return promise;
}

function prepareContent(content) {
    // Due to the way HTML is usually written the vast majority of templates
    // start an end with a text node, usually containing some white space
    // and new lines. The renderer uses these as delimiters for the start and
    // end of templated content, to enable removal even after templated content
    // has mutated. If the template does NOT start or end with a text node, we
    // should insert a couple of empty ones to enable this.
    const first = content.childNodes[0];
    const last  = content.childNodes[content.childNodes.length - 1];

    if (!isTextNode(first)) {
        content.prependChild(document.createTextNode(''));
    }

    if (isTextNode(last)) {
        // Slice off space from the end of the last node and use it to create an
        // end delimiter.
        const space = /\s*$/.exec(last.nodeValue);
        last.nodeValue = space.input.slice(0, space.index);
        content.appendChild(document.createTextNode(space[0]));
    }
    else {
        content.appendChild(document.createTextNode(''));
    }
}

function newRenderer(renderer) {
    // `this` is the fragment of the new renderer
    const node    = getDescendant(renderer.path, this);
    const element = isTextNode(node) ? node.parentNode : node ;
    return new renderer.constructor(node, renderer, element);
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
        //this.context   = {};
        this.fragment  = cache[id].content.cloneNode(true);
        this.first     = this.fragment.childNodes[0];
        this.last      = this.fragment.childNodes[this.fragment.childNodes.length - 1];
        this.renderers = cache[id].renderers.map(newRenderer, this.fragment);
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

    prepareContent(template.content);

    // Pick up const names from data-name attributes, such that the attribute 
    // data-hello makes the const ${ hello } available inside the template.
    this.consts    = template.dataset ? Object.keys(template.dataset) : nothing ;
    this.content   = template.content;
    this.fragment  = template.content.cloneNode(true);
    this.first     = this.fragment.childNodes[0];
    this.last      = this.fragment.childNodes[this.fragment.childNodes.length - 1];

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
console.log(name, Object.keys(renderer.paths)),
                    renderer.paths[name] ?
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

        const promise = Promise
        .all(renderers.map((renderer) => render(renderer, observer, data)))
        .then((counts) => {
            logCounts(counts);
            return this.fragment;
        });
    },
    
    stop: function() {
        // We must not empty .renderers, they are compiled and cached and may 
        // be used again. We can stop listening to sets and make .render() a
        // noop.
        this.sets.stop();
        this.render = noop;
    },
    
    remove: function() {
        let count = 0;
        // Remove this.first and this.last and all nodes in between
        let node = this.last;

        while (node !== this.first) {
            const previous = node.previousSibling;
            node.remove();
            ++count;
            node = previous;
        }

        this.first.remove();
        return ++count;
    }
});

   
import getPath     from '../../../fn/modules/get-path.js';
import noop        from '../../../fn/modules/noop.js';
import nothing     from '../../../fn/modules/nothing.js';
import identify    from '../../../dom/modules/identify.js';
import isTextNode  from '../../../dom/modules/is-text-node.js';
import compileNode from '../compile-node.js';
import { Observer, observe, getTarget } from '../observer.js';
import reads       from '../observer/reads.js';
import log         from '../log.js';

const DEBUG  = window.DEBUG === true || window.DEBUG && window.DEBUG.includes('literal');

const assign = Object.assign;
const cache  = {};

function add(a, b) {
    return b + a;
}

function logCounts(counts) {
    const count = counts.reduce(add, 0);
    if (count === 0) { return; }
    //log('mutate ', counts.reduce(add, 0), '#ff7246');
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
    if (renderer.paths) {
        renderer.paths.length = 0;
    }
    else {
        renderer.paths = [];
    }
}

function render(renderer, observer, data) {
    empty(renderer);

    const paths = renderer.paths;
    const gets = reads(observer).each((path) => {
        // Keep paths unique
        if (paths.includes(path)) { return; }

        var prev;

        // Make some attempt to remove intermediate paths traversed
        // while getting the value at the end of the path. Warning: not 100% 
        // robust. If we want to be robust about this we need to collect gets
        // async inside the observer, I think.
        while(
            (prev = paths[paths.length - 1])
            && prev.length < path.length
            && path.startsWith(prev)
        ) {
            --paths.length;
        }

        // store the path
        paths.push(path);
    });

    const promise = renderer.render(observer, data);

    // We may only collect synchronous gets – other templates may use 
    // this data object while we are promising and we don't want to
    // include their gets by stopping on .then(). Stop now. If we want to
    // fix this, making a proxy per template instance would be the way to go.
    gets.stop();
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
        this.observables = nothing;
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

    // The options object contains information for renderer objects. It is 
    // mutated as it is passed to each renderer (specifically path, name, 
    // source properties) as renderer construction is synchronous.
    const options = {
        template: id,
        consts:   this.consts.join(', '),
        path:     ''
    };

    this.renderers = compileNode([], options, this.fragment, template);
    this.observables = nothing;

    cache[id] = this;
}

function stop(object) {
    object.stop();
}

assign(TemplateRenderer.prototype, {
    // Default data is an empty object
    render: function(object = {}) {
        const data = getTarget(object);

        // Deduplicate. Not sure this is entirely necessary.
        if (data === this.data) {
            return this.fragment;
        }

        this.data = data;

        const observer  = Observer(data);
        const renderers = this.renderers;
        const promises  = renderers.map((renderer) => render(renderer, observer, data));

        this.observables.forEach(stop);
        this.observables = observer ?
            renderers.flatMap((renderer) =>
                renderer.paths.map((path) =>
                    // Don't getPath() of the observer here, that really makes the machine think hard
                    observe(path, data, getPath(path, data)).each((value) =>
                        render(renderer, observer, data)
                    )
                )
            ) :
            nothing ;

        return Promise
        .all(promises)
        .then((counts) => {
            logCounts(counts);
            return this.fragment;
        });
    },

    stop: function() {
        // We must not empty .renderers, they are compiled and cached and may 
        // be used again. We can stop listening to sets and make .render() a
        // noop.
        this.renderers.forEach(stop);
        this.observables.forEach(stop);
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

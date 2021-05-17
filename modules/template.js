
import compileNode from './compile-node.js';
import Observer    from './observer.js';
import curry       from '../../fn/modules/curry.js';
import nothing     from '../../fn/modules/nothing.js';
import identify    from '../../dom/modules/identify.js';
import Renderer    from './renderer.js';
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
    console.log('Mutations', counts.reduce(add, 0));
}

/* 
Renderer
Descendant paths are stored in the form `"1.12.3.class"`. This enables fast 
cloning of template instances without retraversing their DOMs looking for 
literal attribute and text.
*/

function child(parent, index) {
    return /^[a-zA-Z]/.test(index) ?
        parent :
        parent.childNodes[index] ;
}

function descendant(path, root) {
    const p = path.split(/\./);
    return p.reduce(child, root);
}

function toRenderer(r) {
    // Create new renderer from old with reference to a new node
    return new Renderer(r.fn, r.path, descendant(r.path, this), r.name, r.update);
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

function TemplateRenderer(renderers, consts, fragment) {
    this.consts    = consts;
    this.fragment  = fragment;
    this.sets      = nothing;
    this.renderers = renderers;
}

assign(TemplateRenderer.prototype, {
    render: function observe(object) {
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

export default function Template(template) {
    if (DEBUG && !template.content) {
        throw new Error('Template: template does not have a .content fragment');
    }

    const id = identify(template);
    const fragment = template.content.cloneNode(true);

    if (cache[id]) {
        if (DEBUG) {
            log('cached ', '#' + id + ' { data' + (cache[id].consts.length ? ', ' + cache[id].consts : cache[id].consts) + ' }');
        }

        // Return a clone of the template object with a cloned array of 
        // renderers bound to the new fragment
        return new TemplateRenderer(cache[id].renderers.map(toRenderer, fragment), cache[id].consts, fragment);
    }

    // Pick up const names from data-name attributes, such that the attribute 
    // data-hello makes the const ${ hello } available inside the template.
    const consts = template.dataset ?
        Object.keys(template.dataset) :
        nothing ;

    // An attribute data-data is not allowed: the const ${ data } is reserved
    // by the template and may not be overwritten.
    if (DEBUG && consts.includes('data')) {
        log('render', 'data-data attribute not allowed', 'red');
    }

    // Compile renderers, consts, path, node
    const renderers = compileNode([], consts.join(', '), '', fragment);
    return (cache[id] = new TemplateRenderer(renderers, consts, fragment));
}

Template.fromId = function(id) {
    return Template(document.getElementById(id));
};








import library from '../modules/library.js';

// Augment library!! Todo: clean up when we import the lib into this repo

library.include = curry(function include(url, data) {
    if (!/^#/.test(url)) {
        throw new Error('Template: Only #fragment identifier currently supported as include() url ("' + url + '")');
    }

    const instance = Template.fromId(url.slice(1));
    return instance.render(data || {});
});

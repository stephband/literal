
import compileNode from './compile-node.js';
import Observer    from './observer.js';
import nothing     from '../../fn/modules/nothing.js';
import identify    from '../../dom/modules/identify.js';
import log         from './log.js';

const DEBUG  = window.DEBUG === true;

const assign = Object.assign;
const cache  = {};

function add(a, b) {
    return b + a;
}

function not0(value) {
    return value !== 0;
}

/* 
Renderer
Descendant paths are stored in the form `"1.12.3.class"`.
*/

function child(index, parent) {
    return /^[a-zA-Z]/.test(index) ?
        parent :
        parent.childNodes[index] ;
}

function descendant(path, root) {
    const p = path.split(/\./);
    return p.reduce(child, root);
}

function toRenderer(options) {
    return assign({}, options, {
        node: descendant(options.path, this)
    });
}

function render(status) {
    const fn       = status.fn;
    const names    = status.names = {};
    const observer = status.observer;
    const gets     = Observer.gets(observer, (name, value) => names[name] = true);
    const promise  = fn(observer, status.data);

    // We may only collect synchronous gets – other templates may use 
    // this data object while we are promising and we don't want to
    // include their gets by stopping on .then(). Stop now. If we want to
    // fix this, making a proxy per template instance would be the way to go.
    gets.stop();

    return promise;
}

function TemplateRenderer(renderers, names, fragment) {
    this.consts    = names;
    this.fragment  = fragment;
    this.sets      = nothing;
    this.renderers = renderers;
}

assign(TemplateRenderer.prototype, {
    render: function observe(object) {
        const target = Observer.target(object);

        // Deduplicate. Not sure this is entirely necessary.
        if (target === this.target) {
            return this.fragment.childNodes;
        }

        this.target = target;

        const observer = Observer(target);
        const statuses = [];

        this.sets.stop();
        this.sets = observer ?
            Observer.sets(observer, (name, value) => {
                const renders = statuses.map(function(status) {
                    // If the last render did not access this name (synchronously)
                    // assume there is no need to render.
                    return status.names[name] ?
                        render(status) :
                        0 ;
                });
    
                // Quick out if there were no renders performed
                if (!renders.find(not0)) { return; }
    
                Promise
                .all(renders)
                .then((counts) => {
                    const count = counts.reduce(add, 0);
                    if (count === 0) { return; }
                    console.log('mutations', counts.reduce(add, 0));
                });
            }) :    
            nothing ;

        return Promise.all(this.renderers.map((fn, i) => {
            const status = statuses[i] = { fn, data: target, observer };
            return render(status);
        }))
        .then((counts) => {
            console.log('mutations', counts.reduce(add, 0));
            return this.fragment.childNodes;
        });
    } 
});

export default function Template(template) {
    const id = identify(template);

    if (DEBUG && !template.content) {
        throw new Error('Template: node does not have a .content fragment');
    }

    const fragment = template.content.cloneNode(true);

    if (cache[id]) {
        console.log('Cached', id, cache[id]);

        // Return a clone of the template object with a cloned array of 
        // renderers bound to the new fragment
        return new TemplateRenderer(cache[id].map(toRenderer, fragment), names, fragment);
    }

    // Pick up const names from data-name attributes
    const names = template.dataset ?
        Object.keys(template.dataset) :
        nothing ;

    if (DEBUG && names.includes('data')) {
        log('render', 'data-data attribute not allowed', 'red');
    }

    // renderers, vars, path, node
    const renderers = compileNode([], names.join(', '), '', fragment);
    return (cache[id] = new TemplateRenderer(renderers, names, fragment));
}

Template.fromId = function(id) {
    return new Template(document.getElementById(id));
};


/*
assign(Template.prototype, {
    observe: function(data) {
        this.render = cache[id] = compileObserve(this.consts, this.node, Template);
        this.render(data).then((nodes) => this.nodes = nodes);
        return Observer(data);
    },

    renderDOM: function() {},
    renderHTML: function() {},
    renderValue: function() {}
});
*/



import library from '../../bolt/literal/modules/lib.js';

// Augment library!! Todo: clean up when we import the lib into this repo

library.include = function include(url, data) {
    if (!/^#/.test(url)) {
        throw new Error('Template: Only #hashrefs currently supported as include() urls ("' + url + '")');
    }

    if (!data) {
        
    }

    const render = Template(url.slice(1));
    return render(data || {});
};

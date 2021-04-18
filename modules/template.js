
import compileNode from './compile-node.js';
import Observer    from './observer.js';
import nothing     from '../../fn/modules/nothing.js';
import identify    from '../../dom/modules/identify.js';
import log         from './log.js';

const DEBUG  = window.DEBUG === true;

//const assign = Object.assign;
const cache  = {};

function add(a, b) {
    return b + a;
}

function not0(value) {
    return value !== 0;
}

function render(status) {
    const fn       = status.fn;
    const names    = status.names = {};
    const observer = status.observer;
    const gets     = Observer.gets(observer, (name, value) => names[name] = true);
    const promise  = fn(observer, status.data);

    // We may only collect synchronous gets – other templates may use 
    // this data object while we are promising and we don't want to
    // include their gets by stopping on .then(). Stop now.
    gets.stop();

    return promise;
}

function compileObserve(names, node, Template) {
    const renderers = compileNode([], names.join(', '), node, Template);

    var sets = nothing;
    var target1;

    return function observe(object) {
        const target = Observer.target(object);

        // Dedup. Not sure this is entirely necessary.
        if (target === target1) {
            return node.childNodes;
        }

        target1 = target;

        const observer = Observer(object);
        const statuses = [];

        sets.stop();
        sets = observer ?
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

        return Promise.all(renderers.map((fn, i) => {
            const status = statuses[i] = { fn, data: target, observer };
            return render(status);
        }))
        .then((counts) => {
            console.log('mutations', counts.reduce(add, 0));
            return node.childNodes;
        });
    };
}

export default function Template(source) {
    const id = typeof source === 'string' ?
        source.replace(/^#/, '') :
        identify(source) ;

    const template = typeof source === 'string' ?
        document.getElementById(id) :
        source ;

    const node = template.content ?
        template.content.cloneNode(true) :
        template ;

    if (cache[id]) {
        console.log('Cached', id);
    }

    // Pick up const names from data-name attributes
    const names = template.dataset ?
        Object.keys(template.dataset) :
        nothing ;

    if (DEBUG && names.includes('data')) {
        log('render', 'data-data attribute not allowed', 'red');
    }

    return (cache[id] = compileObserve(names, node, Template));
}

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

import compileNode from './modules/compile-node.js';
import Observer    from './modules/observer.js';
import nothing     from '../../fn/modules/nothing.js';
import identify    from '../../dom/modules/identify.js';
import log         from '../../bolt/literal/modules/log-browser.js';

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

function compileObserve(names, node, Literal) {
    const renderers = compileNode([], names.join(', '), node, Literal);
    var sets = nothing;
    var observer1;

    return function observe(object) {       
        const observer = Observer(object);

        if (!observer) {
            throw new Error('Data is not observable');
        }

        // Dedup. Not sure this is entirely necessary.
        if (observer === observer1) { return node.childNodes; }
        observer1 = observer;

        const data   = Observer.target(observer);
        const statii = [];

        sets.stop();
        sets = Observer.sets(observer, (name, value) => {
            const renders = statii.map(function(status) {
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
        });

        return Promise.all(renderers.map((fn, i) => {
            const status = statii[i] = { fn, data, observer };
            return render(status);
        }))
        .then((counts) => {
            console.log('mutations', counts.reduce(add, 0));
            return node.childNodes;
        });
    };
}

export default function Literal(source) {
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

    return cache[id] = compileObserve(names, node, Literal);
}
/*
assign(Literal.prototype, {
    observe: function(data) {
        this.render = cache[id] = compileObserve(this.consts, this.node, Literal);
        this.render(data).then((nodes) => this.nodes = nodes);
        return Observer(data);
    },

    renderDOM: function() {},
    renderHTML: function() {},
    renderValue: function() {}
});
*/
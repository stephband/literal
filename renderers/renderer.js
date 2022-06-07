
import getPath        from '../../fn/modules/get-path.js';
import nothing        from '../../fn/modules/nothing.js';
import { Observer, getTarget } from '../../fn/observer/observer.js';
import observe        from '../../fn/observer/observe.js';
import toText         from '../modules/to-text.js';
import gets           from '../modules/gets.js';
import { cue, uncue } from './batcher.js';
import { meta }       from './analytics.js';


const assign = Object.assign;
const keys   = Object.keys;

const isPromise = (object) => (object
    && typeof object === 'object'
    && object.then);

const reduce = (values) => values.reduce((output, value) => (
    // Ignore undefined and empty strings
    value === '' || value === undefined ?
        output :
        output + value
));


function stringify(value, string, render) {
    return value && typeof value === 'object' ? (
        // If expression returns a promise
        value.then ?
            value.then((value) => (
                string === '' ?
                    value :
                    string + value
            )) :
        // If expression returns an array with promises
        value.find ?
            value.find(isPromise) ?
                // Resolve promises and join to string
                Promise
                .all(value)
                .then((strings) => (
                    string === '' ?
                        reduce(strings.map(render)) :
                        string + reduce(strings.map(render))
                )) :
            // Otherwise join to string immediately
            string === '' ?
                reduce(value.map(render)) :
                string + reduce(value.map(render)) :
        // pass any other value to render
        string === '' ?
            render(value) :
            string + render(value)
    ) :
    string === '' ?
        render(value) :
        string + render(value) ;
}

export function renderString(values) {
    const strings = values[0];
    return reduce(strings.map((string, i) => (
        i <= values.length ?
            // Strings 0 to n - 1
            stringify(values[i + 1], string, toText) :
            // Final string
            string === '' ? undefined :
            string
    )));
}

export function removeNodes(first, last) {
    // Remove last to first and all nodes in between
    let node  = last;
    let count = 0;

    while (node && node !== first) {
        const previous = node.previousSibling;
        node.remove();
        node = previous;
        ++count;
    }

    first.remove();
    ++count;

    return count;
}


// States

// Collection of paths is synchronous, use a singleton array
const paths   = [];
const postfix = '-fns';

function createDistributor(status) {
    const list = status + postfix;

    return function listen(fn) {
        // If we are already in state `name` call `fn` immediately. This assumes
        // we cannot reenter a state and therefore all handlers are called once
        // only.
        if (this.status === status) {
            fn();
            // Distributor is designed to be used in templates, return undefined
            // to avoid rendering anything.
            return;
        }

        const fns = this[list] || (this[list] = []);
        fns.push(fn);
    };
}

function callReducer(method, triggerable) {
    triggerable[method] ?
        triggerable[method]() :
        triggerable() ;

    return method;
}

function triggerReducer(args, renderer) {
    const method  = args[1];
    const payload = args[3];
    renderer[method] && renderer[method](payload);
    return args;
}

export function trigger(object, method, status, payload) {
    if (object.status === status) { return; }
    object.status = status;

    const contents = object.contents;
    if (contents) { contents.reduce(triggerReducer, arguments); }

    const listeners = object[status + postfix];
    if (listeners) { listeners.reduce(callReducer, method); }

    //log(method, object.constructor.name +  ' #' + object.id, undefined, undefined, 'lightgrey');
    return object;
}

export function renderStopped() {
    console.error('Attempted .push() to stopped renderer', this.id, '#' + this.template, this.path, this.name);
}

export function stop(stopable) {
    return stopable.stop ?
        stopable.stop() :
        stopable() ;
}


// Observers

function toPaths(check, path) {
    // Check for paths traversed while getting to the end of the
    // path - is this path an extension of the last?
    const last = paths[paths.length - 1];
    if (check && last.length < path.length && path.startsWith(last)) {
        --paths.length;
    }

    if (!paths.includes(path)) {
        paths.push(path);
        // Signal to next reduce iteration that we just pushed a
        // path and therefore the next path should be checked as
        // an extension of this one
        return true;
    }
}

function remove(paths, path) {
    const i = paths.indexOf(path);

    // Where path is in paths, remove it
    if (i > -1) {
        paths.splice(i, 1);
    }

    return paths;
}

function stopProperty(object, key) {
    object[key].stop();
    delete object[key];
    return object;
}

function toObservables(renderer, path) {
    const data        = renderer.data;
    const observables = renderer.observables;

    if (!observables[path]) {
        // Don't getPath() of the observer proxy here, that really makes
        // the machine think too hard.
        const value = getPath(path, data);

        observables[path] = observe(path, data, value)
        .each((value) => renderer.push(data));
    }

    return renderer;
}


/**
Renderer()
Base class/mixin for providing contents with the properties
`{ node, path }` and a generic `.push()` method.
**/

export default function Renderer(node, options, element) {
    this.element  = element || node;
    this.node     = node;
    this.path     = options.path;
    this.id       = ++meta.count;
    this.count    = 0;
    this.template = options.template;
    this.observables = {};
}

assign(Renderer.prototype, {
    /**
    .push(data)
    Push data into the renderer. The renderer is now cued to render this data in
    the next render batch.
    **/
    push: function(data) {
        if (window.DEBUG && this.render === renderStopped) {
            console.error('Attempted .push() to stopped renderer', this.id, '#' + (this.template.id || this.template), (this.path ? this.path + ' ' : '') + this.constructor.name);
            return;
        }

        // Cue .render() to be called on the next batch
        return cue(this, arguments);
    },

    /**
    .render(data)
    Renders data to the DOM. Normally you should use `.push(data)`, which cues
    up `render(data)` in the next render batch. This method is used internally
    when immediate rendering is desired.
    **/
    render: function render(object) {
        const stops = this['stop' + postfix];
        if (stops) {
            stops.forEach(stop);
            stops.length = 0;
        }

        paths.length = 0;
        const target = getTarget(object);
        const reads  = target ? gets(target) : nothing ;
        reads.reduce(toPaths);

        // Update `this` before rendering
        this.data = target;
        ++this.count;

        // Evaluate the template. Note that we are potentially leaving
        // observers live here, if any data is set during render we may trigger
        // a further render... not what we want. Do we need to pause observers?
        const stats = this.literally(Observer(target), this.element, this.include);

        // We may only collect synchronous gets – other templates may use
        // this data object and we don't want to include their gets by stopping
        // any later. Stop now. If we want to change this, making an observer
        // proxy per template instance would be the way to go. Currently
        // observer proxies are shared by all observers. We're not going there.
        reads.stop();

        // Stop unused paths
        paths
        // Remove paths from observables keys
        .reduce(remove, keys(this.observables))
        // Stop the remaining keys
        .reduce(stopProperty, this.observables);

        // Start observing new paths
        paths
        .reduce(toObservables, this);

        // Return information about the render
        return stats;
    },

    /**
    .connected(fn)
    Calls `fn` when renderer nodes enter the DOM.
    **/
    connected: createDistributor('dom'),

    /**
    .connect()
    Signals to renderer and all child renderers that they have entered the DOM.
    **/
    connect: function() {
        // object, method, status, payload
        trigger(this, 'connect', 'dom');
    },

    /**
    .done(fn)
    Calls `fn` when renderer is stopped.
    **/
    done: createDistributor('done'),

    /**
    .stop()
    Stops renderer.
    **/
    stop: function() {
        uncue(this);
        keys(this.observables).reduce(stopProperty, this.observables);

        if (window.DEBUG) {
            this.render = renderStopped;
        }

        // object, method, status, payload
        trigger(this, 'stop', 'done');
        return this;
    }
});

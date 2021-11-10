
import nothing        from '../../../fn/modules/nothing.js';
import noop           from '../../../fn/modules/noop.js';
import reads          from '../../../fn/observer/reads.js';
import { getTarget }  from '../../../fn/observer/observer.js';
import { cue, uncue } from './batcher.js';
import toText         from '../to-text.js';
import { meta }       from './analytics.js';

const assign = Object.assign;

const isPromise = (object) => (object && typeof object === 'object' && object.then);

const reduce = (values) => values.reduce((output, value) => (
    // Ignore undefined and empty strings
    value === '' || value === undefined ?
        output :
        output + value
));

export function renderStopped() {
    console.trace('Attempted .render() of stopped renderer', this.id, '#' + this.template, this.path, this.name);
}

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
        //console.log(typeof string, string),
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

    // Treat the marker node specially as it may have been extended with marker.remove()...
    // see include(). TODO: this could do with a bit of a rethink, maybe go back to
    // allowing return of contents rather than just nodes.
    first.constructor.prototype.remove.apply(first);
    ++count;

    return count;
}


/** 
Renderer()
Base class/mixin for providing contents with the properties 
`{ node, path }` and a generic `.render()` method.
**/

function stop(stopable) {
    return stopable.stop ?
        stopable.stop() :
        stopable() ;
}


/* State propogation */

const postfix = '-fns';

function createDistributor(status) {
    const list = status + postfix;

    return function listen(fn) {
        // If we are already in state `name` call `fn` immediately. This assumes 
        // we cannot reenter a state and therefore all handlers are called once 
        // only.
        if (this.status === name) {
            fn();
            // Distributor is designed to be used in templates, return undefined
            // to avoid rendering anything.
            return;
        }

        const fns = this[list] || (this[list] = []);
        fns.push(fn);
    };
}

function call(fn) {
    fn();
}

function triggerReducer(args, renderer) {
    const [parent, method, status, payload] = args;
    renderer[method] && renderer[method](payload);
    return args;
}

function trigger(object, method, status, payload) {
    if (object.status === status) { return; }
    object.status = status;

    const contents = object.contents;
    if (contents) { contents.reduce(triggerReducer, arguments); }

    const listeners = object[status + postfix];
    if (listeners) { listeners.forEach(call); }

    console.log('CONNECT', object.constructor.name, object.id);

    return object;
}

function toPaths(paths, path) {
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
}

export default function Renderer(node, options, element) {
    this.element  = element || node;
    this.node     = node;
    this.path     = options.path;
    this.id       = ++meta.count;
    this.count    = 0;
    this.template = options.template;
}

assign(Renderer.prototype, {
    render: function(data) {
        if (window.DEBUG && this.render === renderStopped) {
            console.error('Attempt to .render() stopped renderer', this.id, '#' + (this.template.id || this.template), (this.path ? this.path + ' ' : '') + this.constructor.name);
        }

        // Cue .render() to be called on the next batch
        return cue(this, arguments);
    },

    update: function render(data) {
        //console.log(this.constructor.name + '#' + this.id + '.update()');

        const stops = this['stop' + postfix];
        if (stops) {
            stops.forEach(stop);
            stops.length = 0;
        }
    
        const paths = this.paths || (this.paths = []);
        paths.length = 0;

        // TODO: are we really forced to make a gets stream on every render?
        // it makes attribute animations heavy. Can we optimise?
        const gets = data ?
            reads(data).each((path) => toPaths(paths, path)) :
            nothing ;

        // Update render count before rendering in case .count is used inside 
        // the template
        ++this.count;

        // Evaluate the template
        const meta = this.literally(data, getTarget(data), this.element);

        // We may only collect synchronous gets – other templates may use 
        // this data object while we are promising and we don't want to
        // include their gets by stopping on .then(). Stop now. If we want to
        // change this, making a data proxy per template instance would be the 
        // way to go.
        gets.stop();

        // Return count of DOM mutations
        return meta;
    },


    /* States */

    connected: createDistributor('dom'),

    connect: function() {
        // object, method, status, payload
        trigger(this, 'connect', 'dom');
    },

    done: createDistributor('done'),

    stop: function() {
        uncue(this);
        this.render = window.DEBUG ? renderStopped : noop ;
        // object, method, status, payload
        trigger(this, 'stop', 'done');
        return this;
    }
});



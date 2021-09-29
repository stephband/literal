
import nothing        from '../../../fn/modules/nothing.js';
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
    // allowing return of renderers rather than just nodes.
    first.constructor.prototype.remove.apply(first);
    ++count;

    return count;
}


/** 
Renderer()
Base class/mixin for providing renderers with the properties 
`{ node, path }` and a generic `.render()` method.
**/

function stop(stopable) {
    return stopable.stop ?
        stopable.stop() :
        stopable() ;
}

export default function Renderer(node, options, element) {
    this.element   = element || node;
    this.node      = node;
    this.path      = options.path;
    this.id        = ++meta.count;
    this.count     = 0;
    this.template  = options.template;
}

assign(Renderer.prototype, {
    cue: function(data) {
        if (DEBUG && this.render === renderStopped) {
            console.error('Attempt to .cue() stopped renderer', this.id, '#' + (this.template.id || this.template), (this.path ? this.path + ' ' : '') + this.constructor.name);
        }

        // Cue .render() to be called on the next batch
        return cue(this, arguments);
    },

    render: function(data) {
        if (this.stopables) {
            this.stopables.forEach(stop);
            this.stopables.length = 0;
        }

        const paths = this.paths || (this.paths = []);
        paths.length = 0;

        const gets = data ?
            reads(data).each((path) => {
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
            }) :
            nothing;

        ++this.count;

        const p = this.literally(data, getTarget(data), this.element);
        const q = this.resolve(p);
        
        // TextRenderer no longer has .update() - should the others follow suit?
        this.update && this.update(q);

        // We may only collect synchronous gets – other templates may use 
        // this data object while we are promising and we don't want to
        // include their gets by stopping on .then(). Stop now. If we want to
        // change this, making a data proxy per template instance would be the 
        // way to go.
        gets.stop();
    },

    resolve: renderString,
    
    stop: function() {
        if (this.stopables) {
            this.stopables.forEach(stop);
            this.stopables.length = 0;
        }

        uncue(this);

        if (DEBUG) {
//console.log('stopped ', this.id, '#' + (this.template.id || this.template), (this.path ? this.path + ' ' : '') + this.constructor.name);
            this.render = renderStopped;
        }

        return this;
    },

    done: function(stopable) {
        const stopables = this.stopables || (this.stopables = []);
        stopables.push(stopable);
        return this;
    }
});

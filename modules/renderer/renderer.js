
import { remove }       from 'fn/remove.js';
import Signal, { ObserveSignal } from 'fn/signal.js';
import Data             from 'fn/data.js';
import scope            from '../scope.js';
import { cue, uncue }   from './cue.js';
import toText           from './to-text.js';


const assign     = Object.assign;
const $stopables = Symbol('stopables');

export const stats = {
    attribute: 0,
    property:  0,
    token:     0,
    text:      0,
    remove:    0,
    add:       0
};

const properties = {
    renderCount: { writable: true },
    status:      { writable: true }
};

let id = 0;


/**
data
The main object passed into the template carrying data. This object is special.
When it mutates, the DOM re-renders.
**/

/**
this
The current renderer. Normally you wouldn't reference `this` in a template
unless you want to print information about the renderer of the current text
or attribute.

```html
Renderer render count: ${ this.renderCount }
Renderer id:           ${ this.id }
```
**/

function stop(stopable) {
    stopable.stop();
}

function promiseStop() {
    this.status === 'done';
}

function renderValue(renderer, args, values, n, object, isRender = false) {
    if (object && typeof object === 'object') {
        // Avoid having property gets registered as observers
        const target = Data.objectOf(object);

        // Is target have .then()?
        if (typeof target.then === 'function') {
            const asyncs = renderer.asyncs || (renderer.asyncs = []);
            values[n] = '';

            // You can't stop a promise, but we can flag it to be ignored
            target.stop = promiseStop;
            target.then((value) => {
                if (target.status === 'done') { return; }
                remove(asyncs, target);
                return renderValue(renderer, args, values, n, value, true);
            });

            asyncs.push(target);
            return;
        }

        // If target has a .stop() method add it to asyncs, objects stopped on
        // renderer invalidation and stop.
        if (typeof target.stop === 'function') {
            const asyncs = renderer.asyncs || (renderer.asyncs = []);
            asyncs.push(target);
        }

        // If target has a .pipe() method render its piped values
        if (typeof target.pipe === 'function') {
            values[n] = '';
            // Do not render synchronous values that are in the stream
            // immediately, as they are about to be rendered by the renderer
            let isRender = false;
            target.pipe({ push: (value) => renderValue(renderer, args, values, n, value, isRender) });
            isRender = true;
            return;
        }

        // Is target an array?
        if (typeof target.length === 'number') {
            let i = target.length;
            while (i--) {
                renderValue(renderer, args, target, i, target[i]);
            }
        }
    }

    values[n] = object;

    // If the isRender flag is set, send to render
    if (isRender) {
        // Todo: work out a way of cueing this render??
        renderer.render.apply(renderer, args);
    }
}

function render(renderer, args) {
    const strings = args[0];

    // Flag the literal as containing exactly 1 expression optionally
    // surrounded by whitespace, which allows for some optimisations
    // further down the line, particularly for attribute renderers. We
    // need only do this on first render.
    if (renderer.singleExpression === undefined) {
        renderer.singleExpression = strings.length === 2
            && !/\S/.test(strings[0])
            && !/\S/.test(strings[1]) ;
    }

    let n = 0;
    while (strings[++n] !== undefined) {
        renderValue(renderer, args, args, n, args[n]);
    }

    renderer.render.apply(renderer, args);
}


/*
Renderer(signal, fn, consts, element, name, debug)
*/

export default class Renderer {
    static consts = ['DATA', 'data', 'element', 'shadow', 'host', 'id'];

    #data;
    #render;

    constructor(signal, render, consts, element, name, debug) {
        Object.defineProperties(this, properties);

        this.#data       = signal;
        this.#render     = render;
        this.consts      = consts;
        this.element     = element;
        this.renderCount = 0;
        this.status      = 'idle';

        // Assign debug properties and track the number of renderers created
        if (window.DEBUG) {
            this.template = debug.template;
            this.path     = debug.path;
            this.code     = debug.code;
            this.id       = this.constructor.name + '#' + (++id) ;
            ++Renderer.count;
        }
    }

    evaluate() {
        // Bind this renderer to current data
        const data = this.#data.value;
        if (!data) return;

        // Update template consts. We are ok to do this even if consts is a
        // shared object, because consts.data and consts.DATA are only accessed
        // synchronously by #render().
        this.consts.data    = Data.of(data);
        this.consts.DATA    = Data.objectOf(data);
        this.consts.element = this.element;

        // Render!
        ++this.renderCount;
        return render(this, this.#render(this.consts));
    }

    invalidate() {
        // A renderer, as a consumer, does not have validity or dependent
        // signals to invalidate. It does have status.
        if (this.status === 'done' || this.status === 'cued') return;

        // Stop async values being rendered
        this.asyncs && this.asyncs.forEach(stop);

        // Cue evaluation on next frame
        cue(this);
    }

    stop() {
        // Check and set status
        if (this.status === 'done') return this;
        if (this.status === 'cued') {
            if (window.DEBUG) console.log('Stopping cued renderer. Not the cheapest thing to be doing a lot. We should not really be getting in here, its a sign of something gone awry.');
            uncue(this);
        }

        // Set this.status = 'done'
        ObserveSignal.prototype.stop.apply(this);

        // Stop async values being rendered
        this.asyncs && this.asyncs.forEach(stop);

        // Decrement number of active renderers
        if (window.DEBUG) { --Renderer.count; }

        // Call done functions and listeners
        const stopables = this[$stopables];
        if (stopables) {
            this[$stopables] = undefined;
            stopables.forEach(stop);
        }

        return this;
    }

    done(stopable) {
        // If stream is already stopped call listener immediately
        if (this.status === 'done') {
            stopable.stop();
            return this;
        }

        const stopables = this[$stopables] || (this[$stopables] = []);
        stopables.push(stopable);
        return this;
    }
}

if (window.DEBUG) {
    Renderer.count = 0;
}


import { remove }       from '../../../fn/modules/remove.js';
import Signal, { ObserveSignal } from '../../../fn/modules/signal.js';
import Data             from '../../../fn/modules/data.js';
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

function callStop(stopable) {
    stopable.stop();
}


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

// Observers

function setCancelled(object) {
    object.cancelled = true;
}

function stopPromises(promises) {
    if (!promises) { return; }
    promises.forEach(setCancelled);
    promises.length = 0;
}

function renderValue(renderer, args, values, n, object, isRender = false) {
    if (object && typeof object === 'object') {
        // Avoid having property gets registered as observers
        const target = Data.objectOf(object);

        // Is target have .then()?
        if (typeof target.then === 'function') {
            const promises = renderer.promises || (renderer.promises = []);
            values[n] = '';
            target.then((value) => {
                // You can't stop a promise, but we can flag it to be ignored
                if (target.cancelled) { return; }
                remove(promises, target);
                return renderValue(renderer, args, values, n, value, true);
            });
            promises.push(target);
            return;
        }

        // Is target a pipeable Stream?
        if (typeof target.pipe === 'function') {
            const streams = renderer.streams || (renderer.streams = []);
            values[n] = '';
            // Do not render synchronous values that are in the stream
            // immediately, as they are about to be rendered by the renderer
            let isRender = false;
            target.pipe({ push: (value) => renderValue(renderer, args, values, n, value, isRender) });
            isRender = true;
            streams.push(target);
            return;
        }

        /*
        // Does target have .stop()? We want to call .stop() when this renderer
        // is stopped.
        if (typeof target.stop === 'function') {
            const streams = renderer.streams || (renderer.streams = []);
            values[n] = '';
            streams.push(target);
            return;
        }
        */

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


function renderExpressionValue(value) {
    if (typeof value !== 'object') { return value; }

    if (value.then) { return Signal.from(value); }
    if (value.stop) {}
    if (value.each) {}
}


/*
Renderer(signal, fn, consts, element, name, debug)
*/

export default class Renderer {
    static consts = ['data', 'DATA', 'element', 'host', 'shadow'];

    #data;
    #render;

    constructor(signal, render, consts, element, name, debug) {
        // Pick up paremeter names from the constructor, which may have been
        // overridden on dependent constructors
        //const consts = this.constructor.consts;

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
            ++Renderer.count;
        }
    }

    evaluate() {
        // Bind this renderer to current data
        const data = this.#data.value;
        if (!data) return;

        // Update template consts. We are ok to do this even if consts is a
        // shared object, because consts.data and consts.DATA are only accessed
        // synchronously by #render()
        const consts = this.consts;
        consts.data    = Data.of(data);
        consts.DATA    = Data.objectOf(data);
        consts.element = this.element;

        ++this.renderCount;
        return this.#render(consts);
    }

    invalidate() {
        // A renderer, as a consumer, does not have validity or dependent
        // signals to invalidate. It does have status.
        if (this.status === 'done') return;
        if (this.status === 'cued') {
console.warn(this.constructor.name + ' ' + this.template + ' ' + this.path + ' already cued');
            return;
        }

        // Cue .update()
        cue(this);
        this.status = 'cued';
    }

    update() {
        // .update() is called by the cue timer
        stopPromises(this.promises);

        // Evaluating this as a signal composes the expressions and renders
        Signal.evaluate(this, this.evaluate);
        this.status = 'idle';
        return this;
    }


    /*
    .compose(strings, ...args)
    The renderer method called by compiled literal function
    */
    compose(strings) {
        // Flag the literal as containing exactly 1 expression optionally
        // surrounded by whitespace, which allows for some optimisations
        // further down the line, particularly for attribute renderers. We
        // need only do this on first render.
        if (this.singleExpression === undefined) {
            this.singleExpression = strings.length === 2
                && !/\S/.test(strings[0])
                && !/\S/.test(strings[1]) ;
        }

        let n = 0;
        while (strings[++n] !== undefined) {
            renderValue(this, arguments, arguments, n, arguments[n]);
        }

        return this.render.apply(this, arguments);
    }

    stop() {
        // Check and set status
        if (this.status === 'done') return this;
        if (this.status === 'cued') uncue(this);

        // Sets this.status = 'done'
        ObserveSignal.prototype.stop.apply(this);

        stopPromises(this.promises);
        this.streams && this.streams.forEach(callStop);

        if (window.DEBUG) { --Renderer.count; }

        // Call done functions and listeners
        const stopables = this[$stopables];
        if (stopables) {
            this[$stopables] = undefined;
            stopables.forEach(callStop);
        }

        return this;
    }

    done(stopable) {
        // Is stream already stopped? Call listener immediately.
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

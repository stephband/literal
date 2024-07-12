
import { remove }       from '../../../fn/modules/remove.js';
import Signal, { ObserverSignal } from '../../../fn/modules/signal.js';
import Data             from '../../../fn/modules/signal-data.js';
import scope            from '../scope.js';
import { cue, uncue }   from './cue.js';
import toText           from './to-text.js';


const $stopables = Symbol('stopables');

export const stats = {
    attribute: 0,
    property:  0,
    token:     0,
    text:      0,
    remove:    0,
    add:       0
};

let id = 0;

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

        // Is target a Promise?
        if (target.then) {
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

        //if (Signal.isSignal(target)) {
        //    //
        //}

        // Is target a pipeable Stream?
        if (target.pipe) {
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
        // Is target a Stream that is already consumed, and therefore does not
        // have .pipe()? We still want to stop it when the renderer is
        // destroyed, but we don't want to renderer anything.
        if (Stream.isStream(target)) {
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
        // Todo: work out a way of cueing this render
        renderer.render.apply(renderer, args);
    }
}


/*
Renderer(path, name, source, message)
*/
let N = 0;
export default class Renderer {
    static parameterNames = ['data', 'DATA', 'element', 'host', 'shadow'];

    #data;

    constructor(signal, fn, parameters, element) {
        // Pick up paremeter names from the constructor, which may have been
        // overridden on dependent constructors
        const parameterNames = this.constructor.parameterNames;

        this.id          = ++id;
        this.fn          = fn;
        this.element     = element;
        this.status      = 'idle';
        this.parameters  = parameterNames.map((name) => parameters[name]);
        this.renderCount = 0;
        this.#data       = signal;

        // Track the number of renderers created
        if (window.DEBUG) { ++Renderer.count; }

        // A synchronous evaluation while signal value is undefined binds this
        // renderer to changes to the data object. The signal must be empty
        // during construction, and be given value later. (Otherwise, this will
        // have to be moved to the bottom of each constructor so the renderers
        // are fully ready.)
        Signal.evaluate(this, this.#evaluate);
    }

    #evaluate() {
        // Bind this renderer to current data
        const data = this.#data.value;

        if (!data) return;
        const parameters = this.parameters;

        parameters[0] = Data.of(data);
        parameters[1] = Data.objectOf(data);
        parameters[2] = this.element;

        return this.fn.apply(this, parameters);
    }

    invalidate() {
        // A renderer, as a consumer, does not have validity or dependent
        // signals to invalidate. It does have status.
        if (this.status === 'done') return this;
        if (this.status === 'cued') return this;

        // Cue .update()
        cue(this);
    }

    update() {
        stopPromises(this.promises);
        this.status = 'rendering';

        if (window.DEBUG) {
            try {
                ++this.renderCount;
                // Evaluation causes DOM render
                Signal.evaluate(this, this.#evaluate);
            }
            catch(e) {
                // TODO: add template id to error message
                e.message += '\n    in ' + this.message;
                throw e;
            }
        }
        else {
            ++this.renderCount;
            Signal.evaluate(this, this.#evaluate);
        }

        this.status = this.status === 'rendering' ? 'idle' : this.status ;
        return this;
    }

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

        // Loop over strings[1] to end, evaluate argument that precedes
        // each string, collapsing them to primitives
        let n = 0;
        while (strings[++n] !== undefined) {
            renderValue(this, arguments, arguments, n, arguments[n]);
        }

        return this.render.apply(this, arguments);
    }

    stop() {
        // Check and set status
        if (this.status === 'done') return this;

        // Sets status
        ObserverSignal.prototype.stop.apply(this);

        uncue(this);
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

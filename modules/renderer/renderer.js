
import { remove }       from '../../../fn/modules/remove.js';
import Signal, { ObserverSignal } from '../../../fn/modules/signal.js';
import Data             from '../../../fn/modules/signal-data.js';
import scope            from '../scope-dom.js';
import { cue, uncue }   from './cue.js';
import toText           from './to-text.js';

const assign = Object.assign;
const create = Object.create;
const keys   = Object.keys;
const values = Object.values;

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
        const target = Data.object(object);

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

        /*
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

export default class Renderer extends Signal {
    static parameterNames = ['data', 'DATA', 'element', 'host', 'shadow'];

    constructor(fn, element, name, parameters) {
        super(() => fn.apply(this, this.getParameters()));

        // Pick up paremeter names from the constructor, which may have been
        // overridden on dependent constructors
        const parameterNames = this.constructor.parameterNames;

        this.id          = ++id;
        this.element     = element;
        this.name        = name;
        this.status      = 'idle';
        this.parameters  = parameterNames.map((name) => parameters[name]);
        this.renderCount = 0;

        // Track the number of renderers created
        if (window.DEBUG) { ++Renderer.count; }
    }

    getParameters() {
        const parameters = this.parameters;
        parameters[0] = this.data;
        parameters[1] = Data.object(this.data);
        parameters[2] = this.element;
        return parameters;
    }

    push(object) {
        if (window.DEBUG && this.status === 'rendering') {
            throw new Error('Renderer is rendering, cannot .push() data');
        }

        if (window.DEBUG && this.status === 'done') {
            throw new Error('Renderer is done, cannot .push() data');
        }

        const data = Data.of(object);

        if (this.data === data) { return; }
        this.data = data;
        this.invalidate();
    }

    invalidate() {
        super.invalidate();
        // Cue .update()
        if (this.status === 'cued') return;
        cue(this);
    }

    update() {
        stopPromises(this.promises);
        this.status = 'rendering';

        // literalise the template. Todo: note that we are potentially leaving
        // observers live here, if any data is set during render we may trigger
        // a further render... which could cause an infinite loop. Not what we
        // want. Do we need to pause observers? Yes probably. A voire.
        if (window.DEBUG) {
            try {
                ++this.renderCount;
                // Getting value causes DOM render. I know. A little bizarre.
                let value = this.value;
            }
            catch(e) {
                // TODO: add template id to error message
                e.message += '\n    in ' + this.message;
                throw e;
            }
        }
        else {
            ++this.renderCount;
            // Get rendered something or other
            let value = this.value;
        }

        this.status = this.status === 'rendering' ? 'idle' : this.status ;
        return this;
    }

    compose(strings) {
        // Stop recording gets – other templates may use
        // this data object and we don't want to include their gets by stopping
        // any later. Stop now. If we want to change this, making an observer
        // proxy per template instance would be the way to go. Currently
        // observer proxies are shared by all observers. We're not going there.
        //this.records.stop();

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
        uncue(this);
        stopPromises(this.promises);
        //stopStreams(this.streams);

        if (window.DEBUG) { --Renderer.count; }

        // Stop signal. Sets this.status = 'done'.
        return ObserverSignal.prototype.stop.apply(this);
    }

    done = ObserverSignal.prototype.done;
}

if (window.DEBUG) {
    assign(Renderer, {
        // Track number of active renderers
        count: 0
    });
}

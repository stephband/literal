
import { remove }       from '../../../fn/modules/remove.js';
import Stream, { stop } from '../../../fn/modules/stream/stream.js';
import observe          from '../../../fn/observer/observe.js';
import Gets             from '../../../fn/observer/gets.js';
import scope            from '../scope-dom.js';
import Data             from '../data.js';
import compile          from './compile.js';
import { cue, uncue }   from './cue.js';
import toText           from './to-text.js';

const assign = Object.assign;
const create = Object.create;
const keys   = Object.keys;
const values = Object.values;

let id = 0;
let currentrenderer;


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

function callStop(object) {
    object.stop();
}

function setCancelled(object) {
    object.cancelled = true;
}

function stopObservers(observers) {
    let path;
    for (path in observers) {
        // Stop observers that have no value
        observers[path].stop();
        delete observers[path];
    }
}

function stopPromises(promises) {
    if (!promises) { return; }
    promises.forEach(setCancelled);
    promises.length = 0;
}

function stopStreams(streams) {
    if (!streams) { return; }
    streams.forEach(callStop);
    streams.length = 0;
}

function toRecords(records, record) {
    const last = records[records.length - 1];

    // Check for paths traversed while getting to the end of the path - is this
    // path an extension of the last? If so remove last.
    //
    // This is problematic in cases where an object has been cached, then
    // immediately its cached version used, like this...
    //
    // ${ window.thing = data.thing }
    // ${ window.thing.property }
    //
    // In this case the record accessing 'thing' generated by the first
    // expression is replaced by the record accessing 'thing.property' generated
    // by the second when, ideally, it should not be. This is such an edge case,
    // though, and caching like this is discouraged inside templates.
    if (last
        && last.path.length < record.path.length
        && record.path.startsWith(last.path + '.')
    ) {
        last.path  = record.path;
        last.value = record.value;
    }
    else {
        records.push({
            path:  record.path,
            value: record.value
        });
    }

    return records;
}

function observeData(observers, records, data, renderer) {
    // Construct an object of values for recorded paths
    const values = {};
    let n = -1, path;
    while(++n < records.length) {
        values[records[n].path] = records[n].value;
    }

    for (path in observers) {
        if (path in values) {
            // Remove paths that are already being observed
            delete values[path];
        }
        else {
            // Stop observers that have no value
            observers[path].stop();
            delete observers[path];
        }
    }

    // Create observers for remaining paths
    for (path in values) {
        // Ignore methods
        observers[path] = observe(path, data, values[path])
            .each(() => renderer.cue());
    }
}

function renderValue(renderer, args, values, n, object, isRender = false) {
    if (object && typeof object === 'object') {
        // Avoid having property gets registered as observers
        const target = Data.getObject(object);

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

        // Is target a Stream?
        if (target.pipe) {
            const streams = renderer.streams || (renderer.streams = []);
            values[n] = '';
            // Do not render synchronous values that are in the stream
            // immediately, as they are about to be rendered by the renderer
            let isRender = false;
            target.each((value) => renderValue(renderer, args, values, n, value, isRender));
            isRender = true;
            streams.push(target);
            return;
        }

        // Is target a Stream that is already consumed, and therefore does not
        // have .each()? We still want to stop it when the renderer is
        // destroyed, but we don't want to renderer anything.
        if (Stream.isStream(target)) {
            const streams = renderer.streams || (renderer.streams = []);
            values[n] = '';
            streams.push(target);
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
        // Todo: work out a way of cueing this render
        renderer.render.apply(renderer, args);
    }
}


/*
Renderer(path, name, source, message)
*/

export default function Renderer(path, name, source, message = '') {
    this.literal = compile(source, scope, this.parameterNames.join(', '), message);
    this.path    = path;
    this.name    = name;
    this.message = message;
}

assign(Renderer.prototype, {
    parameterNames: ['data', 'DATA', 'element', 'host', 'shadow'],

    getParameters: function() {
        const parameters = this.parameters;
        parameters[0] = this.data;
        parameters[1] = Data.getObject(this.data);
        parameters[2] = this.element;
        return parameters;
    },

    create: function(element, parameters) {
        // Track the number of active renderers
        if (window.DEBUG) { ++Renderer.count; }

        return assign(create(this), {
            id:          ++id,
            element:     element,
            observers:   {},
            status:      'idle',
            parameters:  this.parameterNames.map((name) => parameters[name]),
            renderCount: 0
        });
    },

    cue: function(value) {
        stopObservers(this.observers);
        cue(this);
        return this;
    },

    push: function(data) {
        if (window.DEBUG && this.status === 'rendering') {
            throw new Error('Renderer is rendering, cannot .push() data');
        }

        if (window.DEBUG && this.status === 'done') {
            throw new Error('Renderer is done, cannot .push() data');
        }

        data = Data(data);
        if (this.data === data) { return; }

        this.data = data;
        this.cue();
    },

    update: function() {
        const data      = this.data;
        const observers = this.observers;

        stopPromises(this.promises);
        stopStreams(this.streams);
        this.status = 'rendering';

        // Filter out gets from sub-renderers by keeping track of current renderer
        const previousrenderer = currentrenderer;
        currentrenderer = this;

        this.records = Gets(data).filter(() => currentrenderer === this);
        const records = this.records.reduce(toRecords, []);

        // literalise the template. Todo: note that we are potentially leaving
        // observers live here, if any data is set during render we may trigger
        // a further render... which could cause an infinite loop. Not what we
        // want. Do we need to pause observers? Yes probably. A voire.
        if (window.DEBUG) {
            try {
                ++this.renderCount;
                this.literal.apply(this, this.getParameters());
            }
            catch(e) {
                // TODO: add template id to error message
                e.message += '\n    in ' + this.message;
                throw e;
            }
        }
        else {
            ++this.renderCount;
            this.literal.apply(this, this.getParameters());
        }

        observeData(observers, records, data, this);
        currentrenderer = previousrenderer;
        this.status = this.status === 'rendering' ? 'idle' : this.status ;
        return this;
    },

    compose: function(strings) {
        // Stop recording gets – other templates may use
        // this data object and we don't want to include their gets by stopping
        // any later. Stop now. If we want to change this, making an observer
        // proxy per template instance would be the way to go. Currently
        // observer proxies are shared by all observers. We're not going there.
        this.records.stop();

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

        this.render.apply(this, arguments);
        return this;
    },

    stop: function() {
        uncue(this);
        stopObservers(this.observers);
        stopPromises(this.promises);
        stopStreams(this.streams);
        // Stop stream. Sets this.status = 'done'.
        stop(this);

        if (window.DEBUG) { --Renderer.count; }

        return this;
    },

    done: Stream.prototype.done
});

if (window.DEBUG) {
    assign(Renderer, {
        // Track number of active renderers
        count: 0
    });
}

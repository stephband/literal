
import { remove } from '../../fn/modules/remove.js';
import Stream     from '../../fn/modules/stream/stream.js';
import observe    from '../../fn/observer/observe.js';
import { Observer, getTarget } from '../../fn/observer/observer.js';
import Gets       from '../../fn/observer/gets.js';

import compile    from './compile.js';
import toText     from './to-text.js';
import { cue, uncue } from './cue.js';

const assign = Object.assign;
const keys   = Object.keys;
const values = Object.values;

let CURRENTRENDERER;

/**
data
The main object passed into the template carrying data. This object is special.
When it mutates, the DOM re-renders.
**/

/**
this
The current renderer. Normally you wouldn't reference this unless you want to
print information about the template renderer itself.
**/

// Observers

function stop(object) {
    object.stop();
}

function setStopped(object) {
    object.stopped = true;
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
    promises.forEach(setStopped);
    promises.length = 0;
}

function stopStreams(streams) {
    if (!streams) { return; }
    streams.forEach(stop);
    streams.length = 0;
}

function toParams(params, value) {
    params[params.length] = value;
    params.length += 1;
    return params;
}


// Values
let last;

function toValues(values, record) {
    // Check for paths traversed while getting to the end of the
    // path - is this path an extension of the last?
    if (last && last.length < record.path.length && record.path.startsWith(last)) {
        delete values[last];
    }

    if (!(record.path in values)) {
        values[record.path] = record.value;
        // Signal to next reduce iteration that we just pushed a
        // path and therefore the next path should be checked as
        // an extension of this one
        last = record.path;
        //return record.path;
    }

    return values;
}


/*
function toRecords(records, record) {
    const last = records[records.length - 1];
console.log('Records', last, record, last === record);
    // Check for paths traversed while getting to the end of the
    // path - is this path an extension of the last?
    if (last && (last.path.length < record.path.length) && record.path.startsWith(last.path)) {
console.log('REMOVE');
        --records.length;
    }

    if (!(records.find((r) => r.path === record.path))) {
console.log('ADD', record);
        records.push(record);
    }

    return records;
}
*/

function renderValue(renderer, args, values, n, object, isRender = false) {
    if (object && typeof object === 'object') {
        // Avoid having property gets registered as observers
        const target = getTarget(object);

        // Is target a Promise?
        if (target.then) {
            const promises = renderer.promises || (renderer.promises = []);
            values[n] = '';
            target.then((value) => {
                // You can't stop a promise, but we can flag it to be ignored
                if (target.stopped) { return; }
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

function observeData(observers, values, data, renderer) {
    let path;

    for (path in observers) {
        if (path in values) {
            // Remove from values paths that are already being observed
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
        observers[path] = observe(path, data, values[path]).each(renderer.cue);
    }
}


/**
Renderer(source, render)
Takes a `source` string or optionally a compiled `render` function and creates
a consumer stream.
**/

export default function Renderer(source, scope, parameters, message, fn) {
    this.literal = typeof source === 'string' ?
        // data will be the observer proxy of DATA, which we set in .update()
        compile(source, scope, 'data, DATA' + (parameters ? ', ' + keys(parameters).join(', ') : ''), message) :
        // source is assumed to be the compiled function
        source ;

    this.id         = ++Renderer.count;
    this.parameters = parameters;
    this.message    = message;

    // Parameters have at least length 2 because (data, DATA)
    this.params = parameters ?
        values(parameters).reduce(toParams, { length: 2 }) :
        { length: 2 } ;

    this.observers = {};
    this.status    = 'idle';

    this.cue = (value) => {
        stopObservers(this.observers);
        cue(this);
    };

    this.consume = fn;
}

assign(Renderer.prototype, {
    push: function(data) {
        if (this.status === 'rendering') {
            throw new Error('Renderer is rendering, cannot .push() data');
        }

        if (this.status === 'stopped') {
            throw new Error('Renderer is stopped, cannot .push() data');
        }

        data = Observer(data);
        if (this.data === data) { return; }

        this.data = data;
        this.cue();
    },

    getParameters: function() {
        const parameters = this.params;
        parameters[0] = this.data;
        parameters[1] = getTarget(this.data);
        return parameters;
    },

    update: function() {
        const data      = this.data;
        const observers = this.observers;

        stopPromises(this.promises);
        stopStreams(this.streams);

        // Calls this.render and this.compose
        this.status = 'rendering';

        // Filter out gets from sub-renderers by keeping track of
        // current renderer
        const previousrenderer = CURRENTRENDERER;
        CURRENTRENDERER = this;

        const records = Gets(data).filter(() => CURRENTRENDERER === this) ;
        const values  = records.reduce(toValues, {});

        // literal the template. Todo: note that we are potentially leaving
        // observers live here, if any data is set during render we may trigger
        // a further render... not what we want. Do we need to pause observers?
        // Yes probably. A voire.
        if (window.DEBUG) {
            try {
                this.literal.apply(this, this.getParameters());
            }
            catch(e) {
                e.message += " in " + this.template + " " + this.message;
                throw e;
            }
        }
        else {
            this.literal.apply(this, this.getParameters());
        }

        // We may only collect synchronous gets – other templates may use
        // this data object and we don't want to include their gets by stopping
        // any later. Stop now. If we want to change this, making an observer
        // proxy per template instance would be the way to go. Currently
        // observer proxies are shared by all observers. We're not going there.
        records.stop();
        observeData(observers, values, data, this);
        CURRENTRENDERER = previousrenderer;
        this.status = this.status === 'rendering' ? 'idle' : this.status ;
        return this;
    },

    compose: function(strings) {
        let n = 0;

        while (strings[++n] !== undefined) {
            renderValue(this, arguments, arguments, n, arguments[n]);
        }

        this.render.apply(this, arguments);
        return this;
    },

    render: function(strings) {
        let n = 0;
        let string = strings[n];

        while (strings[++n] !== undefined) {
            // Append to string
            string += toText(arguments[n]) + strings[n];
        }

        this.consume(string);
        return this;
    },

    stop: function() {
        uncue(this);
        stopObservers(this.observers);
        stopPromises(this.promises);
        stopStreams(this.streams);
        this.status = 'stopped';
        Stream.prototype.stop.apply(this);
        --Renderer.count;
        return this;
    },

    done: Stream.prototype.done
});

assign(Renderer, {
    count: 0
});

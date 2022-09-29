
import nothing from '../../fn/modules/nothing.js';
import Stream  from '../../fn/modules/stream/stream.js';
import observe from '../../fn/observer/observe.js';
import { Observer, getTarget } from '../../fn/observer/observer.js';

import compile from './compile.js';
import toText  from './to-text.js';
import Records from './records.js';
import { cue, uncue } from './cue.js';

const assign = Object.assign;
const keys   = Object.keys;
const values = Object.values;


// Observers

function stop(object) {
    object.stop();
}

function stopObservers(observers) {
    let path;
    for (path in observers) {
        // Stop observers that have no value
        observers[path].stop();
        delete observers[path];
    }
}

function stopStreams(streams) {
    if (!streams) { return; }
    streams.forEach(stop);
    streams.length = 0;
}


// Values

// TODO: sort out stats
let VALUES = {};

function toValues(last, record) {
    // Check for paths traversed while getting to the end of the
    // path - is this path an extension of the last?
    if (last && last.length < record.path.length && record.path.startsWith(last)) {
        delete VALUES[last];
    }

    if (!(record.path in values)) {
        VALUES[record.path] = record.value;

        // Signal to next reduce iteration that we just pushed a
        // path and therefore the next path should be checked as
        // an extension of this one
        return record.path;
    }
}

function renderValue(renderer, values, n, object) {
    if (object && typeof object === 'object') {
        // Avoid having properties of object registered as observers
        object = getTarget(object);

        // Is object a Promise?
        /*if (object.then) {
            values[n] = '';
            object.then((value) => renderValue(renderer, values, n, value));
            return;
        }*/

        // Is object a Stream?
        if (object.each) {
            const streams = renderer.streams || (renderer.streams = []);
            values[n] = '';
            object.each((value) => renderValue(renderer, values, n, value));
            streams.push(object);
            return;
        }
    }

    values[n] = toText(object);

    // If the isRender flag is set, send to render
    if (renderer.status !== 'rendering') {
        // Todo: work out a way of cueing this render
        renderer.render.apply(renderer, values);
    }
}

function observeData(observers, values, data, cue) {
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
        observers[path] = observe(path, data, values[path]).each(cue);
    }
}


/**
Renderer(source, render)
Takes a `source` string or optionally a compiled `render` function and creates
a consumer stream.
**/

export default function Renderer(source, scope, parameters, consts, fn) {
    const names  = parameters && keys(parameters);
    //const values = parameters && values(parameters);
    const params = 'data' + (names ? ', ' + names.join(', ') : '');

    this.evaluate = typeof source === 'string' ?
        compile(source, scope, params, consts) :
        source ;

    this.observers  = {};
    this.parameters = [];
    this.status     = 'idle';

    // Avoid creating function multiple times in observeData loop in .update()
    this.cue       = () => cue(this);
    this.consume   = fn;
}

assign(Renderer.prototype, {
    push: function(data) {
        if (this.status === 'stopped') {
            throw new Error('Renderer is stopped, cannot .push() data');
        }

        data = Observer(data);
        if (this.data === data) { return; }

        stopObservers(this.observers);
        this.data = data;
        cue(this);
    },

    update: function() {
        const data       = this.data;
        const parameters = this.parameters;
        const observers  = this.observers;

        parameters[0] = data;
        stopStreams(this.streams);

        // Calls this.render and this.compose
        this.status = 'rendering';

        VALUES = {};
        const records = data ? Records(data) : nothing ;
        records.reduce(toValues);

        // Update `this` before rendering
        //renderer.data = object;
        //++renderer.count;

        // Evaluate the template. Todo: note that we are potentially leaving
        // observers live here, if any data is set during render we may trigger
        // a further render... not what we want. Do we need to pause observers?
        const stats = this.evaluate.apply(this, parameters);

        // We may only collect synchronous gets – other templates may use
        // this data object and we don't want to include their gets by stopping
        // any later. Stop now. If we want to change this, making an observer
        // proxy per template instance would be the way to go. Currently
        // observer proxies are shared by all observers. We're not going there.
        records.stop();
        stats.values = VALUES;

        observeData(observers, stats.values, data, this.cue);
        this.status = 'idle';

        return this;
    },

    compose: function(strings) {
        let n = 0;

        while (strings[++n] !== undefined) {
            renderValue(this, arguments, n, arguments[n]);
        }

        this.render.apply(this, arguments);
        return this;
    },

    render: function(strings) {
        let n = 0;
        let string = '';

        while (strings[++n] !== undefined) {
            // Append to string
            string += strings[n - 1] + arguments[n];
        }

        string += strings[n - 1];
        this.consume(string);
        return this;
    },

    stop: function() {
        uncue(this);
        stopObservers(this.observers);
        stopStreams(this.streams);
        this.status = 'stopped';
        Stream.prototype.stop.apply(this);
        return this;
    },

    done: Stream.prototype.done
});

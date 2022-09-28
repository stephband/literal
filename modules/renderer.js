
import nothing from '../../fn/modules/nothing.js';
import Stream  from '../../fn/modules/stream/stream.js';
import observe from '../../fn/observer/observe.js';
import { Observer, getTarget } from '../../fn/observer/observer.js';

import library from './library.js';
import compile from './compile.js';
import Records from './records.js';
import { cue, uncue } from './cue.js';

const assign = Object.assign;
const keys   = Object.keys;
const values = Object.values;


// Observers

function stopObservers(observers) {
    let path;
    for (path in observers) {
        // Stop observers that have no value
        observers[path].stop();
        delete observers[path];
    }
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

function render(renderer, context, data, parameters, variables) {
    const object  = getTarget(data);
    const records = object ? Records(object) : nothing ;

    VALUES = {};
    records.reduce(toValues);

    // Update `this` before rendering
    //renderer.data = object;
    //++renderer.count;

    // Evaluate the template. Note that we are potentially leaving
    // observers live here, if any data is set during render we may trigger
    // a further render... not what we want. Do we need to pause observers?
    const stats = renderer.render.apply(renderer, parameters);

    // We may only collect synchronous gets – other templates may use
    // this data object and we don't want to include their gets by stopping
    // any later. Stop now. If we want to change this, making an observer
    // proxy per template instance would be the way to go. Currently
    // observer proxies are shared by all observers. We're not going there.
    records.stop();
    stats.values = VALUES;
    return stats;
}

function reobserve(observers, values, data, cue) {
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

export default function Renderer(source, parameters, consts, fn) {
    const names  = parameters && keys(parameters);
    //const values = parameters && values(parameters);
    const params = 'data' + (names ? ', ' + names.join(', ') : '');

    this.render = typeof source === 'string' ?
        compile(source, library, params, consts) :
        source ;

    this.observers  = {};
    this.parameters = [];
    this.status     = 'idle';

    // Avoid creating function multiple times in reobserve loop in .update()
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
        this.cue();
    },

    update: function() {
        const data       = this.data;
        const parameters = this.parameters;
        const observers  = this.observers;

        parameters[0] = data;
        const stats = render(this, this, data, parameters);
        reobserve(observers, stats.values, data, this.cue);

        return this;
    },

    compose: function(strings) {
        let n = 0;
        let string = '';

        while (strings[++n] !== undefined) {
            // Append to string
            string += (strings[n - 1] + (arguments[n] || ''));
        }

        string += strings[n - 1];
        this.consume(string);
        this.mutations = 0;
        return this;
    },

    stop: function() {
        uncue(this);
        stopObservers(this.observers);
        this.status = 'stopped';
        Stream.prototype.stop.apply(this);
        return this;
    },

    done: Stream.prototype.done
});

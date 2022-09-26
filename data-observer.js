
import nothing from '../fn/modules/nothing.js';
import observe from '../fn/observer/observe.js';
import { Observer, getTarget } from '../fn/observer/observer.js';
import Stream, { pipe, push, stop } from '../../fn/modules/stream/stream.js';
import Records from './modules/records.js';
import { cue, uncue } from './modules/cue.js';

const assign = Object.assign;


function stopObservers(observers) {
    let path;
    for (path in observers) {
        // Stop observers that have no value
        observers[path].stop();
        delete observers[path];
        console.log('STOP', path);
    }
}




let values = {};

function toValues(last, record) {
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
        return record.path;
    }
}


var n = 0;
function render(element, data, include) {
    const object  = getTarget(data);
    const records = object ? Records(object) : nothing ;

    values = {};
    records.reduce(toValues);

    // Update `this` before rendering
    //renderer.data = object;
    //++renderer.count;

    // Evaluate the template. Note that we are potentially leaving
    // observers live here, if any data is set during render we may trigger
    // a further render... not what we want. Do we need to pause observers?
    //const stats = renderer.literally(Observer(object), renderer.element, renderer.include);
    const stats = {};
    if (++n % 2 === 0) {
        data.a.x;
        data.b;
        data.c;
    }
    else {
        data.a.x;
        data.b;
    }

    // We may only collect synchronous gets – other templates may use
    // this data object and we don't want to include their gets by stopping
    // any later. Stop now. If we want to change this, making an observer
    // proxy per template instance would be the way to go. Currently
    // observer proxies are shared by all observers. We're not going there.
    records.stop();
    stats.values = values;
console.log(stats.values);
    return stats;
}


export default function Renderer() {
    const stream    = new Stream(this);

    this.observers = {};

    stream
    .each((data) => {
        stopObservers(this.observers);
        this.data = data;
        cue(this);
    })
    .done(() => {
        uncue(this);
        stopObservers(this.observers);
    });
}

assign(Renderer.prototype, {
    pipe: function(output) {
        pipe(this, output);
    },

    push: function(data) {
        push(this[0], data);
    },

    render: function() {
        const data      = this.data;
        const observers = this.observers;

        const stats     = render(this.element, data, this.include);
        const values    = stats.values;

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
                console.log('STOP', path);
            }
        }

        // Create observers for remaining paths
        for (path in values) {
            console.log('OBSERVE', path, values[path]);
            observers[path] = observe(path, data, values[path]).each((value) => {
                console.log('RENDER', value);
                // We dont want to render here, we want to cue!!
                cue(this);
            });
        }

        return stats;
    },

    stop: function() {
        stop(this[0]);
    }
});

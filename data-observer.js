
import observe from '../fn/observer/observe.js';
import Stream  from '../fn/modules/stream.js';



function stopObservers(observers) {
    let path;
    for (path in observers) {
        // Stop observers that have no value
        observers[path].stop();
        delete observers[path];
        //console.log('STOP', path);
    }
}

function cue(observers, data, render) {
    observeAndRender(observers, data, render(data), render);
}

function observeAndRender(observers, data, stats, render) {
    const { values } = stats;
    let path;

    for (path in observers) {
        if (path in values) {
            // Remove paths that are already being observed
            delete values[path];
        }
        else {
            // Stop observers that have no value
            observers[path].stop();
            delete observers[path];
            //console.log('STOP', path);
        }
    }

    // Create observers for remaining paths
    for (path in values) {
        //console.log('OBSERVE', path, values[path]);
        observers[path] = observe(path, data, values[path]).each((value) => {
            //console.log('RENDER', value);
            // We dont want to render here, we want to cue!!
            cue(observers, data, render);
        });
    }

    return observers;
}



export default function track(render) {
    const stream = Stream.of();
    const observers = {};

    stream
    .each((data) => {
        stopObservers(observers);
        cue(observers, data, render);
    })
    .done(() => {
        stopObservers(observers);
    });

    return stream;
}

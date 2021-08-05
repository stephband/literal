
import { group } from '../log.js';

const renderers = [];
const promise   = Promise.resolve(renderers);
let cued;

function render(renderers) {
    if (DEBUG) {
        var t0 = window.performance.now() / 1000;
        group('batch', t0.toFixed(3) + ' (' + renderers.length + ' renderer' + (renderers.length > 1 ? 's)' : ')'), 'green');
        var ids = {};
    }

    var renderer;
    while (renderer = renderers.shift()) {
        // Call .render() with latest arguments
        renderer.render.apply(renderer, renderer.cuedArguments);
        renderer.cuedArguments = undefined;
        ids && (ids[renderer.id] = ids[renderer.id] === undefined ? 1 : ids[renderer.id] + 1);
    }

    cued = undefined;

    if (DEBUG) {
        console.log('rendered', Object.keys(ids).slice(0, 12).join(', ') + (Object.keys(ids).length > 12 ? ', ...' : ''));

        var t1 = window.performance.now() / 1000;
        if (t1 - t0 > 0.016) {
            console.error('batch took longer than a frame (0.016s)', (t1 - t0).toFixed(3) + 's');
        }
        
        if (Object.values(ids).find((n) => n > 1)) {
            console.warn('Literal', 'same renderer rendered multiple times in batch', ids);
        }

        console.groupEnd();
    }
}

/**
cue(renderer, args)
Cues a renderer to be rendered in the next batch with latest args. If the
renderer is already cued args are replaced with latest args.
**/

export function cue(renderer, args) {
    renderer.cuedArguments = args;

    if (!cued) {
        cued = promise.then(render);
    }
    
    renderers.push(renderer);
    return promise;
}

/** 
uncue(renderer)
Removes renderer from the render queue.
**/

export function uncue(renderer) {
    if (!renderers.length) { return; } 

    const i = renderers.indexOf(renderer);
    if (i === -1) { return; }

    renderers.splice(i, 1);
    renderer.cuedArguments = undefined;
}

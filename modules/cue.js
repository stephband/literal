
import { log } from './log.js';

const renderers = [];
const promise   = Promise.resolve(renderers);

let cued;

function render(renderers) {
    var t0, mutations;
    if (window.DEBUG) {
        t0 = window.performance.now() / 1000;
        mutations = 0;
    }

    let stats, n = -1;
    while (renderers[++n] !== undefined) {
        // Allow changes inside template to recue render
        stats = renderers[n].update();

        if (window.DEBUG) {
            mutations += stats.mutations;
        }
    }

    cued = undefined;

    if (window.DEBUG) {
        const t1              = window.performance.now() / 1000;

        log('render',
            t0.toFixed(3) + 's – '
            // renderers
            + renderers.length + ' renderer' + (renderers.length === 1 ? ', ' : 's, ')
            // mutations
            + mutations + ' mutation' + (mutations === 1 ? ', ' : 's, ')
            // duration
            + ((t1 - t0) * 1000).toPrecision(3) + 'ms',
            //
            '', '', '#B6BD00'
        );

        if (t1 - t0 > 0.016666667) {
            log('render took longer than a frame (16.7ms) ' + ((t1 - t0) * 1000).toPrecision(3) + 'ms', '', '', '', '#ba4029');
        }
    }

    renderers.length = 0;
}

/**
cue(renderer)
Cues a renderer to be rendered in the next batch. If the renderer is already
cued it is not cued again.
**/

export function cue(renderer) {
    // Create a new batch end promise where required
    if (!cued) {
        cued = promise.then(render);
    }

    renderers.push(renderer);
    renderer.status = 'cued';
    return cued;
}

/**
uncue(renderer)
Removes renderer from the render queue.
**/

export function uncue(renderer) {
    if (renderer.status !== 'cued') { return; }
    if (!renderers.length) { return; }

    const i = renderers.indexOf(renderer);
    if (i > 0) { renderers.splice(i, 1); }

    renderer.status = 'idle';
}

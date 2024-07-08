
import { log, group, groupEnd } from '../log.js';
import { stats } from './renderer.js';

const renderers = [];
const promise   = Promise.resolve(renderers);

let cued;

function render(renderers) {
    let t0, t1;

    if (window.DEBUG && window.DEBUG.literal !== false) {
        t0 = window.performance.now() / 1000;
        stats.attribute = 0;
        stats.property  = 0;
        stats.token     = 0;
        stats.text      = 0;
        stats.add       = 0;
        stats.remove    = 0;
    }

    let n = -1;
    while (renderers[++n] !== undefined) {
        // Allow changes inside template to recue render
        renderers[n].update();
    }

    if (window.DEBUG && window.DEBUG.literal !== false) {
        t1 = window.performance.now() / 1000;

        log('render',
            ((t1 - t0) * 1000).toPrecision(3) + 'ms – '
            // renderers
            + renderers.length + ' renderer' + (renderers.length === 1 ? '' : 's') + ' cued'
            // mutations
            + (stats.add       ? ', ' + stats.add       + ' add'    + (stats.add       === 1 ? '' : 's') : '')
            + (stats.remove    ? ', ' + stats.remove    + ' remove' + (stats.remove    === 1 ? '' : 's') : '')
            + (stats.text      ? ', ' + stats.text      + ' text'   + (stats.remove    === 1 ? '' : 's') : '')
            + (stats.property  ? ', ' + stats.property  + ' prop'   + (stats.property  === 1 ? '' : 's') : '')
            + (stats.attribute ? ', ' + stats.attribute + ' attr'   + (stats.attribute === 1 ? '' : 's') : '')
            + (stats.token     ? ', ' + stats.token     + ' token'  + (stats.token     === 1 ? '' : 's') : ''),
            //
            '', '', '#B6BD00'
        );

        if (t1 - t0 > 0.016666667) {
            log('render took longer than a frame (16.6667ms) ' + ((t1 - t0) * 1000).toPrecision(3) + 'ms', '', '', '', '#ba4029');
        }
    }

    cued = undefined;
    renderers.length = 0;
}

/**
cue(renderer)
Cues a renderer to be rendered in the next batch. If the renderer is already
cued it is not cued again.
**/

export function cue(renderer) {
    if (renderer.status === 'cued') {
        console.trace('Renderer already cued.');
        return cued;
    }

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

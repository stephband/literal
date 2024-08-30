
import { log, group, groupEnd } from '../log.js';
import Signal    from 'fn/signal.js';
import { stats } from './renderer.js';

const renderers = [];
//const promise   = Promise.resolve(renderers);

let cued;

function render(t) {
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

    let n = -1, renderer;
    while (renderer = renderers[++n]) {
        // Evaluating renderer as a signal composes the expressions and renders
        Signal.evaluate(renderer, renderer.evaluate);
        renderer.status = 'idle';
        //renderers[n].update();
    }

    if (window.DEBUG && window.DEBUG.literal !== false) {
        t1 = window.performance.now() / 1000;

        log('render',
            // Frame time
            (t / 1000).toFixed(3) + 's – '
            // renderers
            + renderers.length + ' renderer' + (renderers.length === 1 ? '' : 's') + ' fired'
            // mutations
            + (stats.remove    ? ', ' + stats.remove    + ' remove'    : '')
            + (stats.add       ? ', ' + stats.add       + ' add'       : '')
            + (stats.text      ? ', ' + stats.text      + ' text'      : '')
            + (stats.property  ? ', ' + stats.property  + ' property'  : '')
            + (stats.attribute ? ', ' + stats.attribute + ' attribute' : '')
            + (stats.token     ? ', ' + stats.token     + ' token'     : '')
            + ' mutations'
            // Render duration
            + ' – ' + ((t1 - t0) * 1000).toPrecision(3) + 'ms',
            //
            '', '', '#B6BD00'
        );

        if (t1 - t0 > 0.016666667) {
            log('render', (t / 1000).toFixed(3) + 's',
                'took longer than a frame',
                ' t0 ' + t0.toFixed(3) + ','
                + ' t1 ' + t0.toFixed(3) + ','
                + ' ' + ((t1 - t0) * 1000).toPrecision(3) + 'ms',
                '#ba4029');
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
    //log('cue', renderer.constructor.name + '[' + renderer.id + ']', '', '', 'blue');
    // Create a new cued render process by promise...
    //if (!cued) cued = promise.then(render);
    // ...or by animation frame
    if (cued === undefined) cued = requestAnimationFrame(render);
    renderers.push(renderer);
    renderer.status = 'cued';
    return cued;
}

/**
uncue(renderer)
Removes renderer from the render queue.
**/

export function uncue(renderer) {
    const i = renderers.indexOf(renderer);
    if (i > 0) {
        renderers.splice(i, 1);
        renderer.status = 'idle';
    }
    return renderer;
}

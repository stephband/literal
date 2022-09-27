
import { log, group, groupCollapsed, groupEnd } from '../modules/log.js';
import analytics from './analytics.js';
import { cache as compileCache } from '../modules/compile.js';

const renderers = [];
const promise   = Promise.resolve(renderers);

const logs = window.DEBUG && {
    totalCompileTime:  0,
    totalCompileCount: 0,
    totalMutations:    0
};

let cued;

function constructorCount(renderers) {
    // Count constructors
    return renderers
    .map((renderer) => renderer.constructor.name)
    .reduce((names, name) => {
        const i = names.indexOf(name);
        if (i === -1) { names.push(1, name); }
        else          { ++names[i - 1]; }
        return names;
    }, [])
    .reduce((string, value) => string + (
        typeof value === 'number' ?
            string ? ', ' + value :
            value :
        ' ' + value
    ), '');
}

function render(renderers) {
    var t0, ids;
    if (window.DEBUG) {
        t0 = window.performance.now() / 1000;
        logs.mutations = 0;
        //groupCollapsed('batch', t0.toFixed(3) + 's - cued ' + constructorCount(renderers), '#B6BD00');
        ids = {};
    }

    let renderer, stats;
    while (renderer = renderers.shift()) {
        // Allow changes inside template to recue render
        renderer.status = 'rendering';
        stats = renderer.update();

        if (window.DEBUG) {
            logs.mutations      += stats.mutations;
            logs.totalMutations += stats.mutations;
            ids && (ids[renderer.id] = ids[renderer.id] === undefined ? 1 : ids[renderer.id] + 1);
        }
    }

    cued = undefined;

    if (window.DEBUG) {
        const keys = Object.keys(ids);
        const t1 = window.performance.now() / 1000;

        if (logs.totalCompileTime !== analytics.totalCompileTime) {
            logs.batchCompileTime = analytics.totalCompileTime - logs.totalCompileTime;
            logs.totalCompileTime = analytics.totalCompileTime;

            const ids      = Object.keys(compileCache);
            //const batchIds = ids.slice(logs.totalCompileCount);
            const totalCompileCount = ids.length;

            logs.batchCompileCount = totalCompileCount - logs.totalCompileCount;
            logs.totalCompileCount = totalCompileCount;

            log('compile', logs.batchCompileCount + ' literal' + (logs.batchCompileCount === 1 ? '' : 's') + ', ' + logs.batchCompileTime.toPrecision(3) + 'ms', undefined, undefined, '#DDB523');
        }
        else {
            logs.batchCompileTime = 0;
        }

        log('render',
            t0.toFixed(3) + 's - '
            // renderers
            + keys.length + ' renderer' + (keys.length === 1 ? ', ' : 's, ')
            // mutations
            + logs.mutations + ' mutation' + (logs.mutations === 1 ? ', ' : 's, ')
            // duration
            + ((t1 - t0) * 1000 - logs.batchCompileTime).toPrecision(3) + 'ms'
            // ids
            + ' (#' + keys.slice(0, 12).join(', #') + (keys.length > 12 ? ', ...)' : ')'),
            //
            '', '', '#B6BD00'
        );

        if (Object.values(ids).find((n) => n > 1)) {
            console.warn('Literal', 'same renderer rendered multiple times in batch', ids);
        }

        //groupEnd();

        if (t1 - t0 > 0.016666667) {
            log('render took longer than a frame (16.7ms) ' + ((t1 - t0) * 1000).toPrecision(3) + 'ms', '', '', '', '#ba4029');
        }
    }
}

/**
cue(renderer)
Cues a renderer to be rendered in the next batch. If the renderer is already
cued it is not cued again.
**/

export function cue(renderer) {
    // Ignore if renderer is already cued
    if (renderer.status === 'cued') {
        return promise;
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
    if (!renderer.cued) { return; }
    if (!renderers.length) { return; }

    const i = renderers.indexOf(renderer);
    if (i > 0) { renderers.splice(i, 1); }

    renderer.status = 'idle';
}

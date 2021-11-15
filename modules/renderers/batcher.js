
import { log, group, groupEnd } from '../log.js';
import analytics from './analytics.js';
import { cache as compileCache } from '../compile.js';

const renderers = [];
const promise   = Promise.resolve(renderers);

const logs = window.DEBUG && {
    totalCompileTime: 0,
    totalCompileCount: 0
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
    if (window.DEBUG) {
        var t0 = window.performance.now() / 1000;
        group('batch', t0.toFixed(3) + 's – cued ' + constructorCount(renderers), '#B6BD00');
        var ids = {};
    }

    var renderer, count = 0;
    while (renderer = renderers.shift()) {
        // Call .render() with latest arguments
        count += renderer.render.apply(renderer, renderer.cuedArguments);
        renderer.cuedArguments = undefined;
        renderer.cued = false;
        if (window.DEBUG) {
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
            const totalCompileCount = Object.keys(compileCache).length;
            logs.batchCompileCount = totalCompileCount - logs.totalCompileCount;
            logs.totalCompileCount = totalCompileCount;
            log('compile', logs.batchCompileCount + ' literal' + (logs.batchCompileCount === 1 ? '' : 's') + ', ' + logs.batchCompileTime.toPrecision(3) + 'ms', ' total', totalCompileCount + ' literals, ' + (logs.totalCompileTime).toPrecision(3) + 'ms', '#DDB523');
        }
        else {
            logs.batchCompileTime = 0;
        }

        log('render',
            // renderers
            keys.length + ' renderer' + (keys.length === 1 ? ', ' : 's, ')
            // mutations
            + count + ' mutation' + (count === 1 ? ', ' : 's, ') 
            // duration
            + ((t1 - t0) * 1000 - logs.batchCompileTime).toPrecision(3) + 'ms' 
            // ids
            + ' (#' + keys.slice(0, 12).join(', #') + (keys.length > 12 ? ', ...)' : ')'), 
            // 
            '', '', 'orange'
        );

        if (Object.values(ids).find((n) => n > 1)) {
            console.warn('Literal', 'same renderer rendered multiple times in batch', ids);
        }

        groupEnd();

        if (t1 - t0 > 0.016) {
            log('render took longer than a frame (0.016s) ' + (t1 - t0).toFixed(3) + 's', '', '', '', '#ba4029');
        }
    }
}

/**
cue(renderer, args)
Cues a renderer to be rendered in the next batch with latest args. If the
renderer is already cued, args are replaced with latest args.
**/

export function cue(renderer, args) {
    renderer.cuedArguments = args;

    // Ignore if renderer is already cued
    if (renderer.cued) {
        return promise;
    }

    // Create a new batch end promise where required
    if (!cued) {
        cued = promise.then(render);
    }

    renderers.push(renderer);
    renderer.cued = true;
    return cued;
}

/** 
uncue(renderer)
Removes renderer from the render queue.
**/

export function uncue(renderer) {
    if (!renderers.length) { return; }
    if (!renderer.cued) { return; }

    const i = renderers.indexOf(renderer);
    if (i > 0) { renderers.splice(i, 1); }
    renderer.cuedArguments = undefined;
    renderer.cued = false;
}

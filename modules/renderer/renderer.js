
import remove      from 'fn/remove.js';
import Data        from 'fn/data.js';
import { FrameSignal } from 'fn/signal.js';
import Literal     from '../literal.js';
import { Include } from '../scope/include.js';


function stop(stopable) {
    stopable.stop();
}

function promiseStop() {
    this.status = 'done';
}

function triggerRender(renderer, root) {
    // Dispatch back to single-expression or multi-expression render path
    if (renderer.singleExpression) renderer.renderSingle(root[0]);
    else renderer.render.apply(renderer, root);
}

function renderValue(renderer, root, values, n, object, isRender = false) {
    if (object && typeof object === 'object') {
        // Avoid having property gets registered as observers
        const target = Data.objectOf(object);

        // Pass Literal instances and Include descriptors straight through to render
        if (target instanceof Literal || target instanceof Include) {
            if (values[n] !== object) values[n] = object;
            if (isRender) triggerRender(renderer, root);
            return;
        }

        // Is target have .then()?
        if (typeof target.then === 'function') {
            const stopables = renderer.stopables || (renderer.stopables = []);
            values[n] = '';

            // You can't stop a promise, but we can flag it to be ignored
            target.stop = promiseStop;
            target.then((value) => {
                if (target.status === 'done') { return; }
                remove(stopables, target);
                return renderValue(renderer, root, values, n, value, true);
            });

            stopables.push(target);
            return;
        }

        // If target has a .stop() method add it to stopables, objects stopped on
        // renderer invalidation and stop.
        if (typeof target.stop === 'function') {
            const stopables = renderer.stopables || (renderer.stopables = []);
            stopables.push(target);
        }

        // If target has a .pipe() method render its piped values
        if (typeof target.pipe === 'function') {
            values[n] = '';
            // Do not render synchronous values that are in the stream
            // immediately, as they are about to be rendered by the renderer
            let isRender = false;
            target.pipe({ push: (value) => renderValue(renderer, root, values, n, value, isRender) });
            isRender = true;
            return;
        }

        // Array: inspect non-trivial object elements for nested promises or streams
        if (Array.isArray(target)) {
            let i = target.length;
            while (i--) {
                const item = target[i];
                if (item && typeof item === 'object'
                 && !(item instanceof Include)
                 && !(item instanceof Literal)
                 && !(item instanceof Node)) {
                    renderValue(renderer, root, target, i, item);
                }
            }
        }
    }

    if (values[n] !== object) values[n] = object;

    // If the isRender flag is set, send to render
    if (isRender) {
        // Todo: work out a way of cueing this render??
        triggerRender(renderer, root);
    }
}

export default class Renderer extends FrameSignal {
    static consts = ['DATA', 'data', 'element', 'shadow', 'host'];

    constructor(fn, parameters, compiled) {
        // FrameSignal does not evaluate immediately when no fn passed in
        super();

        this.compiled         = compiled;
        this.count            = 0;
        this.fn               = fn;
        this.parameters       = parameters;
        // Compile-time single-expression flag from target avoids args allocation and .apply()
        this.singleExpression = Boolean(compiled && compiled.singleExpression);
    }

    invalidate(input) {
        const cued = super.invalidate(input);
        if (!cued) return;
        if (this.stopables) {
            this.stopables.forEach(stop);
            this.stopables.length = 0;
        }
        return cued;
    }

    evaluate() {
        // Render count
        ++this.count;

        const { fn, parameters } = this;

        // Fast path: single-expression templates return their value directly
        if (this.singleExpression) {
            const value = fn(parameters);
            if (value && typeof value === 'object') {
                const target = Data.objectOf(value);
                // Only route promises, streams, stopables, or arrays through renderValue
                if (!(target instanceof Literal)
                 && !(target instanceof Include)
                 && !(target instanceof Node)
                 && (typeof target.then === 'function'
                  || typeof target.stop === 'function'
                  || typeof target.pipe === 'function'
                  || Array.isArray(target))) {
                    const box = [value];
                    renderValue(this, box, box, 0, value);
                    this.renderSingle(box[0]);
                    return;
                }
            }
            this.renderSingle(value);
            return;
        }

        // General path: tagged template returning [strings, ...values]
        const args    = fn(parameters);
        const strings = args[0];

        let n = 0;
        while (strings[++n] !== undefined) renderValue(this, args, args, n, args[n]);
        this.render.apply(this, args);
    }

    stop() {
        if (this.stopables) {
            this.stopables.forEach(stop);
            this.stopables.length = 0;
        }
        return super.stop();
    }
}

export const stats = {};

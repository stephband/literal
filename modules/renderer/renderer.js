
import remove   from 'fn/remove.js';
import Data     from 'fn/data.js';
import Signal, { FrameSignal } from 'fn/signal.js';
import Template from '../template.js';

//const ids = {};

function renderValue(renderer, args, values, n, object, isRender = false) {
    if (object && typeof object === 'object') {
        // Avoid having property gets registered as observers
        const target = Data.objectOf(object);

        // Is target have .then()?
        if (typeof target.then === 'function') {
            const asyncs = renderer.asyncs || (renderer.asyncs = []);
            values[n] = '';

            // You can't stop a promise, but we can flag it to be ignored
            target.stop = promiseStop;
            target.then((value) => {
                if (target.status === 'done') { return; }
                remove(asyncs, target);
                return renderValue(renderer, args, values, n, value, true);
            });

            asyncs.push(target);
            return;
        }

        // If target has a .stop() method add it to asyncs, objects stopped on
        // renderer invalidation and stop.
        if (typeof target.stop === 'function') {
            const asyncs = renderer.asyncs || (renderer.asyncs = []);
            asyncs.push(target);
        }

        // If target has a .pipe() method render its piped values
        if (typeof target.pipe === 'function') {
            values[n] = '';
            // Do not render synchronous values that are in the stream
            // immediately, as they are about to be rendered by the renderer
            let isRender = false;
            target.pipe({ push: (value) => renderValue(renderer, args, values, n, value, isRender) });
            isRender = true;
            return;
        }

        // Is target an array?
        if (typeof target.length === 'number') {
            let i = target.length;
            while (i--) {
                renderValue(renderer, args, target, i, target[i]);
            }
        }
    }

    values[n] = object;

    // If the isRender flag is set, send to render
    if (isRender) {
        // Todo: work out a way of cueing this render??
        renderer.render.apply(renderer, args);
    }
}

export default class Renderer extends FrameSignal {
    static consts = ['DATA', 'data', 'element', 'shadow', 'host', 'id'];

    constructor(literal, parameters) {
        // Super does not evaluate immediately when no fn passed in. This should
        // change, possibly, so we dont have to evaluate deliberately here ...
        // or maybe we do need to wait for object set up
        super();

        //if (!ids[template]) ids[template] = 0;
        //this.id         = template + '-' + ++ids[template];
        //this.template   = template;
        this.count      = 0;
        this.literate   = literal;
        this.parameters = parameters;
        this.renderers  = [];
    }

    invalidate(input) {
        // Static observers list
        const observers = this.constructor.observers;

        // If the observer is already cued do nothing
        if (observers.indexOf(this) !== -1) return;

        // Verify that input signal has the right to invalidate this
        //if (input && !hasInput(this, input)) return;

        // Clear inputs
        //clearInputs(this);

        this.cue();
    }

    evaluate() {
        // Renderer may have been stopped as part of this frame's evaluation
        // in which case it has not been removed from observers
        if (this.status === 'done') return;

        // Render count
        ++this.count;

console.log(this.id + ' evaluate ' + this.count);

        const { parameters } = this;
        const args    = this.literate(parameters);
        const strings = args[0];

        // Flag the literal as containing exactly 1 expression optionally
        // surrounded by whitespace, which allows for some optimisations
        // further down the line, particularly for attribute renderers. We
        // need only do this on first render.
        if (this.singleExpression === undefined) {
            this.singleExpression = strings.length === 2
                && !/\S/.test(strings[0])
                && !/\S/.test(strings[1]) ;
        }

        let n = 0;
        while (strings[++n] !== undefined) renderValue(this, args, args, n, args[n]);
        this.render.apply(this, args);
    }

    render(strings) {
console.log('XXXXX', strings, Array.from(arguments).slice(1));




        // Diff arguments against .renderers and update DOM accordingly???
        let n = 0;
        while (arguments[++n]) {
            if (this.renderers[n] === arguments[n]) continue;
            const oldRenderer = this.renderers[n];

            if (oldRenderer) {
                console.log('DESTROY', oldRenderer);

                // Can this upset the observers queue? We are currently evaluating
                // renderers in the observers queue, and if oldRenderer happens to
                // be earlier in the queue the current index could become de-synced
                // when oldRenderer is removed
                oldRenderer.stop();
            }


            this.renderers[n] = arguments[n];
        }

        if (this.renderers.length > arguments.length) {
            n = arguments.length - 2;
            while (this.renderers[++n]) {
                console.log('DESTROY', this.renderers[n]);

                // Can this upset the observers queue? We are currently evaluating
                // renderers in the observers queue, and if oldRenderer happens to
                // be earlier in the queue the current index could become de-synced...
                this.renderers[n].stop();
            }
            this.renderers.length = arguments.length - 1;
        }
    }

    /*
    include(identifier, fn, data) {
        if (data === undefined || data === null) return;

        // If a renderer already exists for this template/data pair...
        let n = -1;
        while (this.renderers[++n]) if (
            this.renderers[n].template === template &&
            this.renderers[n].data === data
        ) {
            // ...return it
            return this.renderers[n];
        }

        // Return new template renderer
        return Template
        .get(identifer)
        .createRenderer(this.element, this.parameters, data);
    }
    */

    stop() {
console.log(this.id + ' stop()');
        return super.stop();
    }
}

export const stats = {};

/** 
Observe()
An object whose fn is called by the proxy traps set and delete when a value
changes. This object is internal-only.

```
.path   - full observable path
.index  - index of path consumed
.target - observer target object
.key    - last parsed key from path
```

**/

import { Observer, analytics, remove, getObservables } from './observer.js';

const DEBUG = window.DEBUG === true;
const assign = Object.assign;

const rkey = /(^\.?|\.)\s*([\w-]*)\s*/g;

function Observe(path, index, target, output) {
    if (!path.length) {
        throw new Error('Path is empty!');
    }

    // Parse path
    rkey.lastIndex = index;
    const r = rkey.exec(path);

    // Check that path is valid
    if (!r) {
        throw new Error('Cant parse path ' + this.path + ' at index ' + this.index);
    }

    // Check that if there is no key we are being instructed to observe all 
    // mutations with a '.' at the end of path (TODO)
    if (!r[2]) {
        console.log('r[1] must be "." (', r[1], path, ') Todo: observe all mutations');
        return;
    }

    this.target = target;
    this.path   = path;
    this.index  = rkey.lastIndex;
    this.key    = r[2];
    this.output = output;

    // Are we at the end of the path?
    if (this.index >= this.path.length) {
        this.fn = this.output;
    }

    this.listen();    
    this.fn(this.target[this.key]);

    if (DEBUG) { ++analytics.observes; }
}

assign(Observe.prototype, {
    fn: function(value) {
        const type = typeof value;

        // We already know that we are not at path end here, as this.fn is 
        // replaced with a consumer at path end (in the contructor).

        // If the value is immutable we have no business observing it
        if (!value || (type !== 'object' && type !== 'function')) {
            if (this.child) {
                this.child.stop();
                this.child = undefined;
            }

            // We are not at path end, and have just received an object that
            // cannot have deep properties, so value must be undefined
            this.output(undefined);
            return;
        }

        if (this.child) {
            this.child.unlisten();
            this.child.target = value;
            this.child.listen();
            //this.child.fn(value);
        }
        else {
            this.child = new Observe(this.path, this.index, value, this.output);
        }

        this.child.fn(value[this.child.key]);
    },

    listen: function() {
        const observer = Observer(this.target);

        if (!observer) {
            console.log('CANNOT LISTEN TO UNOBSERVABLE', this.target);
            return;
        }

        const observables = getObservables(this.key, this.target);
        if (observables.includes(this)) {
            throw new Error('observe.listen this is already bound');
        }
        observables.push(this);
    },
    
    unlisten: function() {
        const observables = getObservables(this.key, this.target);
        remove(observables, this);
    },
    
    stop: function() {
        this.unlisten();
        this.child && this.child.stop();
        this.child = undefined;
        if (DEBUG) { --analytics.observes; }
    }
});

/** 
Observable

```
.each(fn)
.pipe(consumer)
.stop()
```
**/

function start(observable, consumer, current) {
    return new Observe(observable.path, 0, observable.target, typeof consumer === 'function' ?
        (value) => {
            // Deduplicate
            if (value === current) { return; }
            current = value;
            consumer(value);
        } : 
        (value) => {
            // Deduplicate
            if (value === current) { return; }
            current = value;
            consumer.push(value);
        }
    );
}

export default function Observable(path, target, initial) {
    this.path    = path;
    this.target  = target;
    this.initial = initial;
    if (DEBUG) { ++analytics.observables; }
}

assign(Observable.prototype, {
    each: function(fn) {
        this.child = start(this, fn, this.initial);
        return this;
    },

    pipe: function(consumer) {
        start(this, consumer, this.initial);
        return consumer;
    },

    stop: function() {
        this.child.stop();
        if (DEBUG) { --analytics.observables; }
        return this;
    }
});
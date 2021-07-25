
import noop from '../../fn/modules/noop.js';
import nothing from '../../fn/modules/nothing.js';

const DEBUG     = window.DEBUG && window.DEBUG === true || window.DEBUG.includes('Observer');

const $target   = Symbol('target');
const $observer = Symbol('observer');
const $handlers = Symbol('handlers');

const assign       = Object.assign;
const define       = Object.defineProperties;
const isExtensible = Object.isExtensible;
const values       = Object.values;

export const analytics = {
    observables: 0,
    observes: 0
}

// Utils

/*
function isArrayLike(object) {
    return object
    && typeof object === 'object'
    // Slows it down a bit
    //&& object.hasOwnProperty('length')
    && typeof object.length === 'number' ;
}
*/

function remove(array, value) {
    const i = array.indexOf(value);
    if (i > -1) { array.splice(i, 1); }
    return array;
}

function fire(fns, name, value) {
    if (!fns) { return; }
    fns = fns.slice(0);
    var n = -1;
    while (fns[++n]) {
        // Support objects or functions (TEMP)
        if (fns[n].fn) {
            fns[n].fn(name, value);
        }
        else {
            fns[n](name, value);
        }
    }
}


// Observer proxy

function isObservable(object) {
    // Many built-in objects and DOM objects bork when calling their
    // methods via a proxy. They should be considered not observable.
    // I wish there were a way of whitelisting rather than
    // blacklisting, but it would seem not.

    return object
        // Reject primitives and other frozen objects
        // This is really slow...
        //&& !isFrozen(object)
        // I haven't compared this, but it's necessary for audio nodes
        // at least, but then only because we're extending with symbols...
        // hmmm, that may need to change...
        && isExtensible(object)
        // This is less safe but faster.
        //&& typeof object === 'object'

        // Reject DOM nodes
        && !Node.prototype.isPrototypeOf(object)
        // Reject WebAudio context
        && (typeof BaseAudioContext === 'undefined' || !BaseAudioContext.prototype.isPrototypeOf(object))
        // Reject dates
        && !(object instanceof Date)
        // Reject regex
        && !(object instanceof RegExp)
        // Reject maps
        && !(object instanceof Map)
        && !(object instanceof WeakMap)
        // Reject sets
        && !(object instanceof Set)
        && !(window.WeakSet && object instanceof WeakSet)
        // Reject TypedArrays and DataViews
        && !ArrayBuffer.isView(object) ;
}


function trapGet(target, name, observer) {
    let desc;
        // If the property's not a symbol
    return typeof name !== 'symbol'
        // and it's writable
        && ((desc = Object.getOwnPropertyDescriptor(target, name)), !desc || desc.writable)
        // return the observer of its value
        && Observer(target[name])
        // otherwise the value
        || target[name] ;
}

const arrayHandlers = {
    get: trapGet/*,

    set: function(target, name, value, receiver) {
        // We are setting a symbol
        if (typeof name === 'symbol') {
            target[name] = value;
            return true;
        }

        var old = target[name];
        var length = target.length;

        // If we are setting the same value, we're not really setting at all
        if (old === value) { return true; }

        var properties = target[$data].properties;
        var change;

        // We are setting length
        if (name === 'length') {
            if (value >= target.length) {
                // Don't allow array length to grow like this
                target.length = value;
                return true;
            }

            change = {
                index:   value,
                removed: A.splice.call(target, value),
                added:   nothing,
            };

            while (--old >= value) {
                fire(properties[old], undefined);
            }
        }

        // We are setting an integer string or number
        else if (+name % 1 === 0) {
            name = +name;

            if (value === undefined) {
                if (name < target.length) {
                    change = {
                        index:   name,
                        removed: A.splice.call(target, name, 1),
                        added:   nothing
                    };

                    value = target[name];
                }
                else {
                    return true;
                }
            }
            else {
                change = {
                    index:   name,
                    removed: A.splice.call(target, name, 1, value),
                    added:   [value]
                };
            }
        }

        // We are setting some other key
        else {
            target[name] = value;
        }

        if (target.length !== length) {
            fire(properties.length, target.length);
        }

        // Notify the observer
        fire(properties[name], Observer(value) || value);

        var mutate = target[$data].mutate;
        fire(mutate, receiver, change);

        // Return true to indicate success
        return true;
    }*/
};


/** 
ObjectTrap()
**/

const properties = {
    [$handlers]: {},
    [$observer]: {},
    [$target]:   {}
};

function ObjectTrap() {
    this.observables = {};
    this.gets = [];
    this.sets = [];
}

assign(ObjectTrap.prototype, {
    // Inside handlers, observer is the observer proxy or an object that 
    // inherits from it
    get: function get(target, name, proxy) {
        // Don't observe changes to symbol properties, and
        // don't allow Safari to log __proto__ as a Proxy. (That's dangerous!
        // It pollutes Object.prototpye with [$observer] which breaks everything.)
        // Also, we're not interested in observing the prototype chain so
        // stick to hasOwnProperty.
        if (typeof name === 'symbol' || name === '__proto__' || !target.hasOwnProperty(name)) {
            return target[name];
        }

        // Is the property mutable
        const descriptor = Object.getOwnPropertyDescriptor(target, name);
        const mutable    = !descriptor || descriptor.writable || descriptor.set;

        if (mutable) {
            fire(this.gets, name);
        }
        else if (typeof target[name] === 'function') {
            return target[name];
        }

        // Get the observer of its value
        const observer = Observer(target[name]); 
        
        if (!observer) {
            return target[name];
        }

        // If get operations are being monitored, make them monitor the
        // object at the named key also
        var n = -1;
        while(this.gets[++n]) {
            this.gets[n].watch(name);
        }

        return observer;
    },
    
    set: function set(target, name, value, proxy) {
        if (typeof name === 'symbol' || name === '__proto__') {
            target[name] = value;
            return true;
        }

        // If we are setting the same value, we're not really setting at all
        if (target[name] === value) {
            return true;
        }

        var n = -1;
        while(this.gets[++n]) {
            this.gets[n].unwatch(name);
        }

        // Set the target of value on target. Then use that as value just 
        // in case target is doing something funky with property descriptors
        // that return a different value from the value that was set. Rare,
        // but it can happen.
        target[name] = Observer.target(value);
        value = target[name];

        const observables = this.observables[name]; 
        if (observables) {
            fire(observables, value);
        }

        fire(this.sets, name, value);

        // Return true to indicate success to Proxy
        return true;
    },
    
    deleteProperty: function(target, name) {
        if (typeof name === 'symbol' || name === '__proto__') {
            // Delete without notifying
            delete target[name];
            return true;
        }

        if (!target.hasOwnProperty(name)) {
            // Nothing to delete
            return true;
        }

        delete target[name];

        const observables = this.observables[name]; 
        if (observables) {
            fire(observables, target[name]);
        }
        
        // Indicate success to the Proxy
        return true;
    }
});

function createObserver(target) {
    const traps    = new ObjectTrap();
    const observer = new Proxy(target, traps);

    properties[$observer].value = observer;
    properties[$target].value   = target;
    properties[$handlers].value = {
        gets:        traps.gets,
        sets:        traps.sets,
        observables: traps.observables
    };

    define(target, properties);
    return observer;
}


/**
Observer(object)
Create an observer proxy around `object`. Mutations made to this proxy are 
observable via `Observer.sets(object, fn)`. Reads are available 
via `Observer.gets(object)`.
**/

export default function Observer(object) {
    //console.log(('jgv')[$observer]);
    //console.log(object[$observer], isObservable(object));
    return !object ? undefined :
        (object[$observer] || (isObservable(object) ?
            createObserver(object) :
            undefined
        ));
}


/*
Observer.notify(object, path [, value])
Force the `object`'s Observer to register a mutation at `path`. Pass in `value`
to override the value actually at the end of the path.
*/

Observer.notify = function notify(path, object, value) {
    const observer = object[$observer];
    if (!observer) { return; }
    const target = observer[$target];
    const sets   = observer[$handlers].sets;
    const key    = path;
    value = value === undefined ? target[path] : value;
    fire(sets, path, value === undefined ? target[path] : value);
    fire(getObservables(path, target), value);
};


/** 
Observer.target(object)
**/

Observer.target = function target(object) {
    return object && object[$target] || object ;
};




/** 
Observer.gets(object, fn)
Calls `fn` for every property of `object` read via a get operation. Returns an
object with the method `.stop()`.
**/

function stop(gets) {
    gets.stop();
}

function ChildGets(target, path, parent) {
    this.children = {};
    // For some reason chilg proxies are being set... dunno...
    this.target   = Observer.target(target);
    this.parent   = parent;
    this.path     = path;
    target[$handlers].gets.push(this);
}

assign(ChildGets.prototype, {
    watch: function(key) {
        // We may only create one child observer per key
        if (this.children[key]) { return; }
        
        this.children[key] = new ChildGets(this.target[key], key, this);
    },

    unwatch: function(key) {
        // Can't unobserve the unobserved
        if (!this.children[key]) { return; }
        this.children[key].stop();
        delete this.children[key];
    },

    fn: function(name) {
        // Pass concated path to parent fn
        this.parent.fn(this.path + '.' + name);
    },

    stop: function() {
        remove(this.target[$handlers].gets, this);
        values(this.children).forEach(stop);
    }
});

function Gets(target, done) {
    this.children = {};
    this.target   = target;
    this.done     = done;
    target[$handlers].gets.push(this);
}

assign(Gets.prototype, ChildGets.prototype, {
    each: function(fn) {
        this.fn = fn;
        return this;
    },

    stop: function() {
        ChildGets.prototype.stop.apply(this);
        this.fnDone && this.fnDone();
    }
});

Observer.gets = function gets(observer) {
    return new Gets(Observer.target(observer));
};






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

const rkey = /(^\.?|\.)\s*([\w-]*)\s*/g;

function getObservables(key, target) {
    const handlers = target[$handlers];
    const observables = handlers.observables || (handlers.observables = {});
    return observables[key] || (observables[key] = []);
}

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

    //console.log('Observe', path.slice(0, rkey.lastIndex), this.target, this.key);

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

function Observable(path, target) {
    let value;

    this.path  = path;

    this.child = new Observe(path, 0, target, (v) => {
        // Deduplicate
        if (v === value) { return; }
        value = v;
        this.consumer.push(value);
    });
    
    if (DEBUG) { ++analytics.observables; }
}

assign(Observable.prototype, {
    consumer: nothing,

    each: function(fn) {
        this.consumer = { push: fn };
        return this;
    },

    pipe: function(consumer) {
        this.consumer = consumer;
        return consumer;
    },

    stop: function() {
        this.child.stop();
        if (DEBUG) { --analytics.observables; }
        return this;
    }
});


/** 
observe(path, target)
Returns an Observable.
**/

export function observe(path, object) {
    return new Observable(path, Observer.target(object));
}





/** 
Observer.sets(target).each(fn)
Calls `fn` for every property of `target` set. Returns an object with the 
method `.stop()`.
**/

function Sets(target, done) {
    this.target = target;
}

assign(Sets.prototype, {
    done: function(fn) {
        this.fnDone = fn;
        return this;
    },

    each: function(fn) {
        this.fn = fn;
        this.target[$handlers].sets.push(fn);
        return this;
    },

    stop: function() {
        remove(this.target[$handlers].sets, this.fn);
        this.fnDone && this.fnDone();
    }
});

Observer.sets = function sets(observer) {
    return new Sets(Observer.target(observer));
};


/** 
mutations()
**/

export function mutations(selector, object, fn) {
    const observer = Observer(object);
    const names    = [];
    const promise  = Promise.resolve(names);

    function trigger(names) {
        fn(names);
        names.length = 0;
    }

    return new Sets(observer)
    .each((name) => {
        // If selector does not include this property name, ignore
        if (!selector.includes(name)) {
            return;
        }

        // Where names has no pending mutations, light up a promise
        if (!names.length) {
            promise.then(trigger);
        }

        // Then collect mutated names
        names.push(name);
    })
    .done(() => fn = noop);
}

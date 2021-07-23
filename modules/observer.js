
import noop from '../../fn/modules/noop.js';

/* Observer */

const $target   = Symbol('target');
const $observer = Symbol('observer');
const $handlers = Symbol('handlers');


const A            = Array.prototype;
const assign       = Object.assign;
const define       = Object.defineProperties;
const keys         = Object.keys;
const nothing      = Object.freeze([]);
const isExtensible = Object.isExtensible;
const values       = Object.values;


// Utils

function isArrayLike(object) {
    return object
    && typeof object === 'object'
    // Slows it down a bit
    //&& object.hasOwnProperty('length')
    && typeof object.length === 'number' ;
}

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

const properties = {
    [$handlers]: {},
    [$observer]: {},
    [$target]:   {}
};

function createObserver(target) {
    const handlers = {
        gets: [],
        sets: []
    };
/*
console.trace('T', target === Object.prototype, target, name);

    if (Object.prototype === target) {
        throw new Error('NO');
    }
*/

    const observer = new Proxy(target, {
        // Inside handlers, observer is the observer proxy or an object that 
        // inherits from it
        get: function get(target, name, proxy) {
            // Don't observe changes to symbol properties, and
            // don't allow Safari to log __proto__ as a Proxy. That's dangerous!
            // It pollutes Object.prototpye with [$observer] which breaks everything 
            if (typeof name === 'symbol' || name === '__proto__') {
                return target[name];
            }
// console.log(this) ?? Can we use this object to store stuff?
            // Is the property mutable
            const descriptor = Object.getOwnPropertyDescriptor(target, name);
            const mutable    = !descriptor || descriptor.writable || descriptor.set;

            if (mutable) {
                fire(handlers.gets, name);
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
            while(handlers.gets[++n]) {
                handlers.gets[n].watch(name);
            }

            return observer;
        },
        
        set: function set(target, name, value, proxy) {
            // If we are setting the same value, we're not really setting at all
            if (target[name] === value) { return true; }

            var n = -1;
            while(handlers.gets[++n]) {
                handlers.gets[n].unwatch(name);
            }

            // Set the target of value on target. Then use that as value just 
            // in case target is doing something funky with property descriptors
            // that return a different value from the value that was set
            target[name] = Observer.target(value);
            value = target[name];
            fire(handlers.sets, name, value);

            // Return true to indicate success to Proxy
            return true;
        }
    });

    properties[$handlers].value = handlers;
    properties[$observer].value = observer;
    properties[$target].value   = target;

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
    fire(sets, path, value === undefined ? target[path] : value);
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
    this.target   = target;
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
    done: function(fn) {
        this.fnDone = fn;
        return this;
    },

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
observe
**/

export function observe(path, object) {
    console.log('observe', path, Observer.target(object));
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

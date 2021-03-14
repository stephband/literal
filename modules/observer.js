
/* Observer */

const $target   = Symbol('target');
const $observer = Symbol('observer');
const $handlers = Symbol('sets');


const A            = Array.prototype;
const nothing      = Object.freeze([]);
const isExtensible = Object.isExtensible;


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
    //fns = fns.slice(0);
    var n = -1;
    while (fns[++n]) {
        fns[n](name, value);
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


function createObserver(target) {
    const handlers = {
        gets: [],
        sets: []
    };

    return target[$observer] = new Proxy(target, {
        // Inside handlers, observer is the observer proxy or an object that 
        // inherits from it
        get: function get(target, name, proxy) {
            if (typeof name === 'symbol') {
                    // Handle observer symbols
                return name === $target ? target :
                    name === $observer ? proxy :
                    name === $handlers ? handlers :
                    // Return the symbol property value directly
                    target[name] ;
            }

            // Mutable if the property's not a symbol
            let desc;
            const mutable = ((desc = Object.getOwnPropertyDescriptor(target, name)), !desc || desc.writable);

            if (mutable) {
                fire(handlers.gets, name);
            }

            // Return the observer of its value or its value
            return Observer(target[name]) || target[name] ;
        },
        
        set: function set(target, name, value, proxy) {
            // If we are setting the same value, we're not really setting at all
            if (target[name] === value) { return true; }
    
            // Set the target of value on target. Then use that as value just 
            // in case target is doing something funky with property descriptors
            target[name] = value && typeof value === 'object' && value[$target] || value ;
            value = target[name];
            fire(handlers.sets, name, value);

            // Return true to indicate success to Proxy
            return true;
        }
    });
}


/**
Observer(object)
Create an observer proxy around `object`. Mutations made to this proxy are 
observable via `Observer.sets(object, fn)`. Reads are available 
via `Observer.gets(object)`.
**/

export default function Observer(object) {
    return !object ? undefined :
        object[$observer] || (isObservable(object) ?
            createObserver(object) :
            undefined
        );
}


/*
Observer.notify(object, path [, value])
Force the `object`'s Observer to register a mutation at `path`. Pass in `value`
to override the value actually at the end of the path.
*/

Observer.notify = function notify(object, path, value) {
    const observer = object[$observer];
    if (!observer) { return; }
    const target = observer[$target];
    const sets   = observer[$handlers].sets;
    fire(sets, path, value === undefined ? target[path] : value);
};


/** 
Observer.target(object)
Calls `fn` for every property of `object` read via a get operation. Returns an
object with the method `.stop()`.
**/

Observer.target = function target(object) {
    return object[$target] || object ;
};


/*
Ops()
Ops object with a stop method for efficient unbinding.
*/

function Ops(type, observer, fn) {
    this.fns = observer[$handlers][type + 's'];
    this.fn  = fn;
    this.fns.push(fn);
}

Ops.prototype.stop = function() {
    remove(this.fns, this.fn);
};


/** 
Observer.gets(object, fn)
Calls `fn` for every property of `object` read via a get operation. Returns an
object with the method `.stop()`.
**/

Observer.gets = function gets(observer, fn) {
    return new Ops('get', observer, fn);
};


/** 
Observer.sets(object, fn)
Calls `fn` for every property of `object` set. Returns an object with the 
method `.stop()`.
**/

Observer.sets = function sets(observer, fn) {
    return new Ops('set', observer, fn);
};

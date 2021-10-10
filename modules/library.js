
/**
Template functions

The scope of literal templates contains a small library of functions. Some are 
simply JS built-ins aliased for brevity. Others provide template includes, 
routing and value transformations.

**/

import id              from '../../fn/modules/id.js';
import by              from '../../fn/modules/by.js';
import capture         from '../../fn/modules/capture.js';
import equals          from '../../fn/modules/equals.js';
import matches         from '../../fn/modules/matches.js';
import nothing         from '../../fn/modules/nothing.js';
import get             from '../../fn/modules/get-path.js';
import noop            from '../../fn/modules/noop.js';
import slugify         from '../../fn/modules/slugify.js';
import last            from '../../fn/modules/last.js';
import overload        from '../../fn/modules/overload.js';
import { px, em, rem, vw, vh } from '../../dom/modules/parse-length.js';
import { Observer }    from '../../fn/observer/observer.js';
import { observe }     from '../../fn/observer/observe.js';
import combine         from '../../fn/stream/combine.js';
import merge           from '../../fn/stream/merge.js';
import zip             from '../../fn/stream/zip.js';
import print           from '../library/print.js';

const assign  = Object.assign;
const entries = Object.entries;

const library = {
    /** assign(a, b, ...)
    Alias of `Object.assign()`.
    **/
    assign: assign,
    
    /** by(fn, a, b)
    Compares `fn(a)` against `fn(b)` and returns `-1`, `0` or `1`. Partially 
    applicable and intended for use in `array.sort()`. For example, to sort an
    array of objects by their ids:

    ```
    array.sort(by(get('id')))
    ```
    **/
    by,

    /** 
    capture()
    **/
    capture: capture,

    /** 
    combine(source1, source2, ...)
    Combines multiple sources into a single stream.
    **/
    combine: combine,

    /** ceil(n)
    Alias of `Math.ceil()`.
    **/
    ceil: Math.ceil,

    /** define()
    Alias of `Object.defineProperties()`.
    **/
    define: Object.defineProperties,
    
    /** entries(object)
    Alias of `Object.entries()`.
    **/
    entries: entries,

    /** equals(a, b)
    Compares `a` and `b` for deep equality and returns `true` or `false`.
    **/
    equals,

    /** floor(n)
    Alias of `Math.floor()`.
    **/
    floor: Math.floor,

    /** get(path, object)
    Gets the value of `path` in `object`, where `path` is a string in JS 
    dot-notation. Where a path does not lead to a value, returns `undefined`:
    
    ```
    get('path.to.value', {})       // undefined
    ```

    Numbers are accepted as path components:

    ```
    get('array.0', {
        array: ['first', 'second']
    })                             // 'first'
    ```
    **/
    get,
    
    /** id(object)
    Returns `object`.
    **/
    id,
    
    /** keys(object)
    Alias of `Object.keys()`.
    **/
    keys: Object.keys,
    
    /** last()
    Gets the last item from an array or array-like.
    **/
    last,
    
    /** matches(selector, object)
    Returns true where all the properties of `selector` are strictly equal to the 
    same properties of `object`.
    **/
    matches,

    /** 
    merge(source1, source2, ...)
    Merges multiple sources into a single stream.
    **/
    merge,
    
    /** 
    zip(source1, source2, ...)
    Zips multiple sources into a single stream of array.
    **/
    zip,

    /** noop()
    Return undefined.
    **/
    noop,
    
    /* 
    nothing
    A frozen array representing no value.
    */
    //nothing,
    
    /** observe(path, object)
    Returns an observable of mutations to `path` in `object`. Consume mutations
    with an observable's `.each()` method.

    ```js
    const observable = observe('title', data).each((title) => console.log(title));
    ```

    Observables may be stopped with the method `.stop()`:

    ```js
    observable.stop();
    ```

    Renderers (which are exposed as `this` inside templates), have a `.done()` 
    method that calls a subscriber's `.stop()` method when the render is 
    stopped. This pattern observes `data.title` until the next render:

    ```js
    this.done(observe('title', data).each((title) => console.log(title)));
    ```
    **/
    observe,

    /* Observer(object)
    Returns the Observer proxy of `object`. Use this proxy to make changes to 
    an object that may be observed using `observe(path, object)` (above).
    */
    Observer,

    /* overload(fn, object) */
    overload,
    
    print: window.DEBUG ? print : noop,

    /** round(n)
    Alias of `Math.round()`;
    **/
    round: Math.round,

    /** 
    paramify(object)
    Turns an object with enumerable properties into a search parameters object
    (which stringifies to a search parameter string).
    **/
    paramify: function(object) {
        // If this is an object with properties that may be arrays, flatten it
        // out into entries
        const params = typeof object === 'object' && typeof object.length !== 'number' ?        
            entries(object).flatMap((entry) => (
                entry[1] === undefined ? nothing :
                entry[1] && typeof entry[1] === 'object' && entry[1].map ? entry[1].map((value) => [entry[0], value]) : 
                [entry]
            )) :
            object ;

        //console.log('PARAMIFY', object, params);
        return new URLSearchParams(params);
    },

    /** slugify(string)
    Returns the slug of `string`.
    **/
    slugify,

    /** 
    translate()
    **/
    translate: function(key) {
        return window.translations && window.translations[key] || key;
    },

    /** values()
    Alias of `Object.values()`.
    **/
    values: Object.values,

    px,
    em,
    rem,
    vw,
    vh
};

export default library;

export function register(name, fn) {
    if (library[name]) {
        throw new Error('Literal: function "' + name + '" already registered');
    }

    library[name] = fn;

    // Allow registered fns to be exported directly from their modules via
    // `export default register(name, fn);` by returning `fn`.
    return fn;
}

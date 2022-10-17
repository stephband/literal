
/**
Template functions

The scope of literal templates contains a small library of functions. Some are
simply JS built-ins aliased for brevity. Others provide template includes,
routing and value transformations.

**/

import id              from '../../fn/modules/id.js';
import by              from '../../fn/modules/by.js';
import { clamp }       from '../../fn/modules/clamp.js';
//import capture         from '../../fn/modules/capture.js';
import equals          from '../../fn/modules/equals.js';
import matches         from '../../fn/modules/matches.js';
import nothing         from '../../fn/modules/nothing.js';
import get             from '../../fn/modules/get-path.js';
import noop            from '../../fn/modules/noop.js';
import slugify         from '../../fn/modules/slugify.js';
import sum             from '../../fn/modules/sum.js';
import last            from '../../fn/modules/last.js';
import overload        from '../../fn/modules/overload.js';
import { Observer, notify }    from '../../fn/observer/observer.js';
import observe         from '../../fn/observer/observe.js';
import Stream          from '../../fn/modules/stream.js';

import paramify        from './library/paramify.js';

const library = {
    /** assign(a, b, ...)
    Alias of `Object.assign()`.
    **/
    assign: Object.assign,

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
    //capture,

    /** ceil(n)
    Alias of `Math.ceil()`.
    **/
    ceil: Math.ceil,

    clamp,

    /** define()
    Alias of `Object.defineProperties()`.
    **/
    define: Object.defineProperties,

    /** entries(object)
    Alias of `Object.entries()`.
    **/
    entries: Object.entries,

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
    For filtering and pattern matching. Returns true where all the properties
    of `selector` object are strictly equal to the same properties of `object`.
    Note that `object` may have more properties than `selector`.
    **/
    matches,

    /** noop()
    Return undefined.
    **/
    noop,

    /*
    nothing
    A frozen array/stream-like object representing no value.
    */
    nothing,

    /** notify(path, object)
    Force observer to register a mutation at `path` of `object`.
    **/
    //notify,

    /** observe(path, object)
    Returns a stream of mutations to `path` in `object`. Consume mutations
    with the stream's `.each()` method.

    ```js
    ${ observe('title', data).map(slugify) }
    ```

    Streams may be stopped with the method `.stop()`:

    ```js
    stream.stop();
    ```

    Renderers (which are exposed as `this` inside templates), have a `.done()`
    method that calls a subscriber's `.stop()` method when the render is
    stopped. This pattern observes `data.title` until the next render:

    ```js
    this.done(observe('title', data).each((title) => console.log(title)));
    ```
    **/
    observe,

    /* Data(object)
    Returns the observer data proxy of `object`. Use this proxy to set
    properties in a way that will be observed by `observe(path, object)`.
    */
    Data: Observer,

    /* overload(fn, object) */
    overload,

    /** rect(node)
    **/
    //rect,

    /** round(n, value)
    Round `value` to the nearest multiple of `n`.
    **/
    round: function(n, value) {
        return Math.round(value / n) * n;
    },

    /**
    paramify(object)
    Turns an object with enumerable properties into a (native) URL search
    parameters object, rejecting undefined properties and flattening out
    array values.
    **/
    paramify,

    /** slugify(string)
    Returns the slug of `string`.
    **/
    slugify,

    /** Stream(fn)
    Returns a stream of values.
    **/
    Stream,

    /** sum(b, a)
    Returns the sum of two values.
    **/
    sum,

    /**
    translate()
    **/
    translate: function(key) {
        return window.translations && window.translations[key] || key;
    },

    /** values()
    Alias of `Object.values()`.
    **/
    values: Object.values
};

export default library;

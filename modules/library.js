
/**
Template functions

The scope of literal templates contains a small library of functions. Some are
simply JS built-ins aliased for brevity. Others provide template includes,
routing and value transformations.

**/

import id              from '../../fn/modules/id.js';
import by              from '../../fn/modules/by.js';
//import capture         from '../../fn/modules/capture.js';
import equals          from '../../fn/modules/equals.js';
import matches         from '../../fn/modules/matches.js';
import nothing         from '../../fn/modules/nothing.js';
import get             from '../../fn/modules/get-path.js';
import noop            from '../../fn/modules/noop.js';
import slugify         from '../../fn/modules/slugify.js';
import last            from '../../fn/modules/last.js';
import overload        from '../../fn/modules/overload.js';
import { px, em, rem, vw, vh } from '../../dom/modules/parse-length.js';
import { Observer, notify }    from '../../fn/observer/observer.js';
import observe         from '../../fn/observer/observe.js';
import Stream          from '../../fn/modules/stream.js';

import paramify        from './library/paramify.js';
import print           from './library/print.js';

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
    Returns true where all the properties of `selector` are strictly equal to the
    same properties of `object`.
    **/
    matches,

    /** noop()
    Return undefined.
    **/
    noop,

    /*
    nothing
    A frozen array representing no value.
    */
    nothing,

    /** notify(path, object)
    Force observer to register a mutation at `path` of `object`.
    **/
    notify,

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

    /** rect(node)
    **/
    //rect,

    /** round(n)
    Alias of `Math.round()`;
    **/
    round: Math.round,

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


/**
Template functions

The scope of literal templates contains a small library of functions. Some are 
simply JS built-ins aliased for brevity. Others provide template includes, 
routing and value transformations.

**/

import id              from '../../fn/modules/id.js';
import by              from '../../fn/modules/by.js';
import equals          from '../../fn/modules/equals.js';
import matches         from '../../fn/modules/matches.js';
import get             from '../../fn/modules/get-path.js';
import noop            from '../../fn/modules/noop.js';
import slugify         from '../../fn/modules/slugify.js';
import last            from '../../fn/modules/last.js';
import overload        from '../../fn/modules/overload.js';
import { px, em, rem, vw, vh } from '../../dom/modules/parse-length.js';
import { Observer, observe } from './observer.js';
import print           from '../library/print.js';

const DEBUG  = window.DEBUG;
const assign = Object.assign;

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
    
    print: DEBUG ? print : noop,

    /** round(n)
    Alias of `Math.round()`;
    **/
    round: Math.round,

    /** slugify(string)
    Returns the slug of `string`.
    **/
    slugify,
    
    /** values()
    Alias of `Object.values()`.
    **/
    values: Object.values,

    px,
    em,
    rem,
    vw,
    vh,

    // The principal render function
    render: function() {
        return arguments;
    }
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


/** Template scope

Literal templates are rendered in a scope that provides some useful objects and
functions in addition to JavaScript's standard library.

The `data` object contains data passed into the template. This object is special
as the DOM is re-rendered in response to mutations.

Expressions that return promises or streams also cause the DOM to be updated
when new values are received. The `events()` function, for example, returns a
mappable stream of events:

```js
${ events('hashchange', window).map((e) => location.hash) }
```

Templates can be composed with `include()` function:

```js
${ include('#some-other-template', data) }
```

Some functions are simply built-ins aliased for brevity. It is nicer to read
`${ values(data) }` than `${ Object.values(data) }` within the constraints of a
template.

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
import FrameStream     from '../../fn/modules/stream/frame-stream.js';
import IntervalStream  from '../../fn/modules/stream/interval-stream.js';

import paramify        from './library/paramify.js';

const library = {
    /**
    assign(a, b, ...)
    Alias of `Object.assign()`.
    **/
    assign: Object.assign,

    by,

    /** ceil(n)
    Alias of `Math.ceil()`.
    **/
    ceil: Math.ceil,

    clamp,

    /** entries(object)
    Alias of `Object.entries()`.
    **/
    entries: Object.entries,

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
    id,

    time: function(duration) {
        return typeof duration === 'frame' ?
            new FrameStream() :
            new IntervalStream(duration) ;
    },

    /** keys(object)
    Alias of `Object.keys()`.
    **/
    keys: Object.keys,

    last,
    matches,
    noop,
    nothing,

    /** notify(path, object)
    Force observer to register a mutation at `path` of `object`.
    **/
    //notify,

    observe,

    /* Data(object)
    Returns the observer data proxy of `object`. Use this proxy to set
    properties in a way that will be observed by `observe(path, object)`.
    */
    Data: Observer,

    overload,


    /** round(n, value)
    Round `value` to the nearest multiple of `n`.
    **/
    round: function(n, value) {
        return Math.round(value / n) * n;
    },

    paramify,
    slugify,

    /** Stream(fn)
    Returns a stream of values.
    **/
    Stream,
    sum,

    /*
    translate()
    */
    translate: function(key) {
        return window.translations && window.translations[key] || key;
    },

    /** values()
    Alias of `Object.values()`.
    **/
    values: Object.values
};

export default library;

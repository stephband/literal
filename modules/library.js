
/** Template scope

Literal templates are rendered in a scope that has a few useful functions
and objects.

The `data` object is the data passed into the template to be rendered:

```js
${ data }
```

Include another template with the `include()` function:

```js
${ include('#another-template', data) }
```

The `include()` function is partially applicable, making it easy to map an array
of objects to templates:

```js
${ data.array.map(include('#item-template')) }
```

Expressions that evaluate as promises or streams cause the DOM to be updated
asynchronously as values resolve. For example, `events()` returns a mappable
stream of events that will update the DOM whenever an event is heard:

```js
${ events('hashchange', window).map((e) => location.hash) }
```

Of course, any old valid JavaScript can be used in an expression. The functions
in scope have been chosen to make templates brief to read for some common
operations. Some are simply aliases of JS built-ins given shorter names.
**/

import id                   from '../../fn/modules/id.js';
import by                   from '../../fn/modules/by.js';
import { clamp }            from '../../fn/modules/clamp.js';
//import capture         from '../../fn/modules/capture.js';
import equals               from '../../fn/modules/equals.js';
import isDefined            from '../../fn/modules/is-defined.js';
import matches              from '../../fn/modules/matches.js';
import nothing              from '../../fn/modules/nothing.js';
import get                  from '../../fn/modules/get-path.js';
import noop                 from '../../fn/modules/noop.js';
import slugify              from '../../fn/modules/slugify.js';
import sum                  from '../../fn/modules/sum.js';
import last                 from '../../fn/modules/last.js';
import normalise            from '../../fn/modules/normalise.js';
import denormalise          from '../../fn/modules/denormalise.js';
import overload             from '../../fn/modules/overload.js';
import { Observer, notify } from '../../fn/observer/observer.js';
import observe              from '../../fn/observer/observe.js';
import Stream               from '../../fn/modules/stream.js';
import ClockStream          from '../../fn/modules/stream/clock-stream.js';

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
    denormalise,

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

    ```js
    ${ get('path.to.value', data) }
    ```

    Numbers are accepted as path components:

    ```js
    ${ get('array.0', data) }
    ```
    **/

    get,
    id,
    isDefined,

    /**
    clock(duration)

    If `duration` is a number, returns a stream of DOM timestamps at `duration`
    seconds apart.

    ```js
    ${ clock(1).map(floor) }
    ```

    <template is="literal-html">
        <p>${ clock(1).map(floor) }</p>
    </template>

    If `duration` is `"frame"`, returns a stream of DOM timestamps of animation
    frames.

    ```js
    ${ clock('frame').map((time) => time.toFixed(2)) }
    ```

    <template is="literal-html">
        <p>${ clock('frame').map((time) => time.toFixed(2)) }</p>
    </template>
    **/

    clock: (duration) => new ClockStream(duration),

    /** keys(object)
    Alias of `Object.keys()`.
    **/
    keys: Object.keys,

    last,
    matches,
    noop,
    normalise,
    nothing,

    /* notify(path, object)
    Force observer to register a mutation at `path` of `object`.
    */
    //notify,

    /*
    observe(name, object)

    Returns a stream of values of `object[name]` whenever property `name` is
    mutated.
    */

    observe,

    /*
    Data(object)

    Returns the data proxy of `object`. Use this proxy to set properties in a
    way that can be observed with `observe(path, object)`.

    Normally this is not needed. It's for advanced use. The `data` object in the
    scope of the template is already a data proxy and mutations to it are
    observed by the template renderer.
    */

    Data: Observer,
    overload,

    /** round(value)
    Round `value` to the nearest integer.
    **/

    /** round(value, n)
    Round `value` to the nearest multiple of `n`.
    **/

    round: (value, n = 1) => Math.round(value / n) * n,

    paramify,
    slugify,
    Stream,
    sum,

    /**
    translate(key)

    Looks up an alternative value stored by `key` in a `window.translations`
    object, if it exists. A super simple translation mechanism, but requires
    `window.translations` to be an object.

    ```js
    ${ translate('Go to homepage') }
    ```
    **/
    translate: function translate(key) {
        if (window.DEBUG && !window.translations) {
            throw new Error('translate() - no window.translations object found');
        }

        return window.translations && window.translations[key] || key;
    },

    /** values()
    Alias of `Object.values()`.
    **/
    values: Object.values
};

export default library;

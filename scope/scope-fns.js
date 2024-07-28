
/** Template scope

Literal templates are compiled in a **scope** that contains a number of
**objects** and **functions** designed for writing concise template
**expressions**.

Expressions are made powerful by Literal's renderer, which renders **strings**
or other **primitives**, **arrays** of values, **promises** or **streams**,
**DOM nodes** and **fragments**, and even other **renderers**.

The `data` object carries data for rendering.

```js
${ data }
```

The `events()` function returns a stream of DOM events.

```js
<!-- Listen to events -->
${ events('click', element).each((e) => { ... }) }
<!-- Map a stream of events to text -->
${ events('change', element).map((e) => e.target.value) }
```

The `include()` function returns a template renderer.

```js
<!-- Include another template -->
${ include('#template-id', data) }
<!-- Include another template and render it when JSON data is fetched -->
${ include('#template-id', './package.json') }
<!-- Include another template for each object in an array -->
${ data.array.map(include('#template-id')) }
```
**/


// Built-ins added to scope with shorter names for template brevity

export const assign  = Object.assign;
export const entries = Object.entries;
export const keys    = Object.keys;
export const values  = Object.values;
export const ceil    = Math.ceil;
export const floor   = Math.floor;
export const round   = (value, n = 1) => Math.round(value / n) * n;


// This is the base set of scope functions. These functions are already used by
// literal so they come at no cost to have them in scope by default. Functions
// not already used by literal should be put in scope-extended.js

export { default as arg         } from '../../../fn/modules/arg.js';
export { default as args        } from '../../../fn/modules/args.js';
export { default as cache       } from '../../../fn/modules/cache.js';
export { default as capture     } from '../../../fn/modules/capture.js';
export { default as choose      } from '../../../fn/modules/choose.js';
export { default as exec        } from '../../../fn/modules/exec.js';
export { default as id          } from '../../../fn/modules/id.js';
export { default as isDefined   } from '../../../fn/modules/is-defined.js';
export { default as last        } from '../../../fn/modules/last.js';
export { default as matches     } from '../../../fn/modules/matches.js';
export { default as noop        } from '../../../fn/modules/noop.js';
export { default as nothing     } from '../../../fn/modules/nothing.js';
export { default as overload    } from '../../../fn/modules/overload.js';
export { default as remove      } from '../../../fn/modules/remove.js';
export { default as set         } from '../../../fn/modules/set-path.js';
export { default as sum         } from '../../../fn/modules/sum.js';
export { default as Data        } from '../../../fn/modules/data.js';
export { default as Signal      } from '../../../fn/modules/signal.js';

export { default as location } from './location.js';



//const library = {
    /**
    assign(a, b, ...)
    Alias of `Object.assign()`.
    **/

    /** ceil(n)
    Alias of `Math.ceil()`.
    **/

    /**
    Data(object)

    Returns the data proxy of `object`. Use this proxy to set properties in a
    way that can be observed with `observe(path, object)`.

    Normally this is not needed. It's for advanced use. The `data` object in the
    scope of the template is already a data proxy and mutations to it are
    observed by the template renderer.
    **/

    /** entries(object)
    Alias of `Object.entries()`.
    **/

    /** floor(n)
    Alias of `Math.floor()`.
    **/

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

    /**
    clock(interval)

    If `interval` is a number, returns a stream of DOM timestamps at `interval`
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

//    clock: (duration) => new ClockStream(duration),

    /** keys(object)
    Alias of `Object.keys()`.
    **/


    /** round(value)
    Round `value` to the nearest integer.
    **/

    /** round(value, n)
    Round `value` to the nearest multiple of `n`.
    **/


    /**
    translate(key)

    Looks up an alternative value stored by `key` in a `window.translations`
    object, if it exists. A super simple translation mechanism that requires
    `window.translations` to be an object.

    ```js
    ${ translate('Go to homepage') }
    ```
    **/

    /* values()
    Alias of `Object.values()`.
    */
//};

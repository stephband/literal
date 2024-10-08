
// Built-ins added to scope with shorter names for template brevity

export const root  = document.documentElement;
export const body  = document.body;
export const frame = window.requestAnimationFrame;


// This is the base set of scope functions. These functions are already used by
// literal so they come at no cost to have them in scope by default. Functions
// not already used by literal should be put in scope-extended.js

export { default as create     } from 'dom/create.js';
export { default as decode     } from 'dom/decode.js';
export { default as identify   } from 'dom/identify.js';
export { default as isTextNode } from 'dom/is-text-node.js';
export { default as parse      } from 'dom/parse.js';
export { default as request    } from 'dom/request.js';
export { default as safe       } from './safe.js';
export { default as toNodeType } from 'dom/to-type.js';
export { default as trigger    } from 'dom/trigger.js';

// Causes import loop because scope is imported into renderers
//export { getValue }              from '../renderer/renderer-value.js';

export function translate(key) {
    if (window.DEBUG && !window.translations) {
        console.warn('Literal translate() - no `window.translations` object');
    }

    return window.translations && window.translations[key] || key;
}


// Extend scope with DOM functions.
//export default Object.assign(scope, {
    //root: document.documentElement,
    //body: document.body,

    //create,
    //decode,
    //delegate,

    /**
    events(type, element)

    Returns a mappable stream of events heard on `element`.

    ```js
    ${ events('click', element).map((e) => e.target.id) }
    ```

    The first parameter may alternatively be a select object. It must have a
    `.type` property.

    ```js
    ${ events({ type: 'click' }, element).map((e) => e.target.id) }
    ```

    The object may contain a number of other properties that select the events
    received. It supports the standard addEventListener options, for passive and
    capture phase event binding.

    ```js
    ${ events({ type: 'scroll', passive: true, capture true }, window)
       .map((e) => window.scrollTop) }
    ```

    And a `.select` property, a CSS selector, that filters events to those with
    targets that match or have a `closest()` ancestor that matches the selector.

    ```js
    ${ events({ type: 'click', select: '[name="button"]' }, element)
       .map((e) => e.target.id) }
    ```

    However, if you need to delegate events it is recommended to use the
    `delegate()` function, which has the added benefit of direct access to the
    delegated target.

    ```js
    ${ events('click', element).each(delegate({
        '[name="button"]': (target, e) => console.log(target.id),
        '[name="remove"]': (target, e) => document.getElementById(target.value).remove(),
        ...
    })) }
    ```

    Stopping an event stream removes event listeners.

    ```js
    ${ events('click', element).stop() }
    ```

    But streams returned from template expressions, like this one, are stopped
    automatically when the renderer is stopped, so normally there is no need to
    worry about managing them.
    **/
    //events,

    /** frame(fn)
    Alias of `window.requestAnimationFrame(fn)`. Aliased for brevity inside
    templates.
    **/

    /** getValue(element)
    TODO
    **/


    /** navigate(url)
    Navigate to a url, alerting the history API where pertinent. Takes optional
    parameters:
    ```
    navigate(url, state, scroll)
    ```
    TODO: better description!
    **/
    //navigate,

    /**
    rect(element)
    A shortcut for `element.getBoundingClientRectangle()`. Returns a DOMRect
    object with `left`, `top`, `width` and `height` properties.
    **/
    //rect,

    /**
    request(method, url)

    Uses `fetch()` to send a request to `url`. Returns a promise.

    ```js
    ${ request('get', './package.json').then(get('author')) }
    ```

    To send data with the request:

    ```js
    ${ request('post', url, data).then(...) }
    ```

    (Where `type` is `"GET"`, `data` is serialised and appended to the URL,
    otherwise it is sent as a request body.)

    A 4th parameter may be a content type string or a headers object
    (in which case it must have a `'Content-Type'` property).

    ```js
    ${ request('post', url, data, {...}).then(...) }
    ```
    **/

//});

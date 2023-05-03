
import delegate                from '../../dom/modules/delegate.js';
import events                  from '../../dom/modules/events.js';
import rect                    from '../../dom/modules/rect.js';
import request                 from '../../dom/modules/request.js';
import { trigger }             from '../../dom/modules/trigger.js';
import { px, em, rem, vw, vh } from '../../dom/modules/parse-length.js';
import library                 from './library.js';


// Export a library with DOM functions.

export default Object.assign({
    delegate,

    /**
    events(type, node)

    Returns a mappable stream of events heard on `node`.

    ```js
    ${ events('click', element).map((e) => e.target.id) }
    ```

    The first parameter may also be an object with a `type` property. If the
    object has a `select` property that is a CSS selector, events are delegated
    from matching targets:

    ```js
    ${ events({ type: 'click', select: '[name="button"]' }, element)
       .map((e) => e.target.value) }
    ```

    Other properties are passed to addEventListener options, for passive and
    capture phase event binding:

    ```js
    ${ events({ type: 'scroll', passive: true, capture true }, window)
       .map((e) => window.scrollTop) }
    ```

    Stopping an event stream removes event listeners. Streams returned from
    expressions are automatically stopped when their renderers are removed.
    **/

    events,

    /**
    rect(element)
    An shortcut for `element.getBoundingClientRectangle()`. Returns a DOMRect
    object with `left`, `top`, `width` and `height` properties.
    **/

    rect,

    /**
    request(method, url)

    Uses `fetch()` to send a request to `url`. Returns a promise.

    ```js
    ${ request(method, url).then(...) }
    ```

    To send data with the request:

    ```js
    ${ request(method, url, data).then(...) }
    ```

    Where `type` is `"GET"`, `data` is serialised and appended to the URL,
    otherwise it is sent as a request body.

    A 4th parameter may be a content type string or a headers object
    (in which case it must have a `'Content-Type'` property).

    ```js
    ${ request(method, url, data, headers).then(...) }
    ```
    **/

    request,
    trigger,
    px,
    em,
    rem,
    vw,
    vh
}, library);

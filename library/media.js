
/**
media(query, enter, exit)

Includes the result of `enter()` when the document matches `query`, and 
otherwise the result of `exit()` where given – the `exit` function may be 
omitted to include nothing on exit:

```
${ media({ minWidth: '70em' }, () => include('#desktop-template', data)) }
```

A query object may contain any combination of the properties:

```js
{
    minWidth:        number | string | fn,
    maxWidth:        number | string | fn,
    minHeight:       number | string | fn,
    maxHeight:       number | string | fn,
    minScrollTop:    number | string | fn,
    maxScrollTop:    number | string | fn,
    minScrollBottom: number | string | fn,
    maxScrollBottom: number | string | fn
}
```

Where a query property is a number it is assumed to be a value in pixels. Where
it is a string it must be a CSS length with units, eg. `'24rem'`. Accepted units
are `'px'`, `'em'`, `'rem'`, `'vw'` or `'vh'`. Where it is a function, the 
function is evaluated (on window resize or scroll) and must return a number in 
pixels.

**/

/*
TODO: maybe it should work differently??
media(query)

Returns `true` if the document matches `query`, otherwise `false`. Also tells
the renderer to rerender when the result would change.

```
${ media(query) ? include('#search-template') : '' }
```
*/

import { register } from '../modules/library.js';
import create  from '../../dom/modules/create.js';
import media   from '../../dom/modules/media.js';
import { log } from '../modules/log.js';

const DEBUG = window.DEBUG && (window.DEBUG === true || window.DEBUG.includes('routes'));

const assign = Object.assign;

export default register('media', function(selector, inside, outside) {
    const marker = create('text', '');
    let node;

    media(selector, function enter() {
console.log('ENTER');
        node && node.stop && node.stop();
        node && node.remove();
        node = inside();
        marker.after(node);
    }, function exit() {
console.log('EXIT');
        node && node.stop && node.stop();
        node && node.remove();
        if (!outside) { return; }
        node = outside();
        marker.after(node);
    });
console.log('RETURN');
    return marker;
});

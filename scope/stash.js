
/**
stash(element)
stash(element, data)

Quick-and-dirty get or set `data` via an expando on an element. Can be very
useful for stashing data for event delegation:

```html
<template id="button">
    <!-- Every button has data stashed on it (and value set to data.id) -->
    <button type="button" value="${ stash(element, data).id }">
        ${ data.text }
    </button>
</template>

...

<menu>
    <!-- Create a button for each object in an array of data -->
    ${ data.map(include('#button')) }

    <!-- Listen to clicks on buttons and pick up their stashed data -->
    ${ events({ type: 'click', select: 'button' }, element).each((e) => {
        const button     = e.target;
        const buttonData = stash(button);
        // Do something with buttonData...
    }) }
</menu>
```
**/

import overload from '../../../fn/modules/overload.js';

const $stash = Symbol('stash');

export default overload(function() { return arguments.length; }, {
    1: (object) => object[$stash],
    2: (object, data) => object[$stash] = data
});

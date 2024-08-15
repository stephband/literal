
/**
stash(element)
stash(element, data)

Quick-and-dirty get or set a value on an element using a WeakMap. Useful for
stashing data for event delegation. Note that the `value` attribute renderer
uses `stash()` internally to store values on elements, which is useful when
you want an `<input>` to have a non-string value. Where an `'input'` or
`'change'` event is delegated these values can be retrieved inside the handler
by getting `stash(input)`.
**/

import overload from 'fn/overload.js';

export const stash = new WeakMap();

export default overload(function() { return arguments.length; }, {
    1: (object) => {
        return stash.get(object);
    },

    2: (object, value) => {
        stash.set(object, value);
        return value;
    },

    default: window.DEBUG ?
        () => { throw new Error('Literal: stash(element) to get stashed value, stash(element, value) to set stashed value'); } :
        undefined
});

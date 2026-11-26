
import cache from 'fn/cache.js';


/**
Include(identifier, data)
Lightweight descriptor returned by `include(identifier, data)` and resolved
against a `TextRenderer`'s instance cache during rendering.
**/

export class Include {
    constructor(identifier, data) {
        // Reject nullish data immediately so template errors surface at call site
        if (data === undefined || data === null) {
            throw new Error('No data passed in to include()');
        }

        this.identifier = identifier;
        this.data       = data;
    }
}

// Cache partially-applied include('#id') callbacks to avoid per-render closures
const curry = cache((identifier) => (data) => new Include(identifier, data));

/**
include(identifier, data)
include(identifier)

Returns a template inclusion descriptor for `TextRenderer` to resolve and cache.
When called with a single argument, returns a cached partially-applied function
suitable for `array.map(include('#id'))`.
**/

export default function include(identifier, data) {
    return arguments.length === 1 ?
        curry(identifier) :
        new Include(identifier, data) ;
}

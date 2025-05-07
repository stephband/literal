
// This is the base set of scope functions. These functions are already used by
// literal so they come at no cost to have them in scope by default.

import Data      from 'fn/data.js';
import Signal    from 'fn/signal.js';
import args      from 'fn/args.js';
import cache     from 'fn/cache.js';
import get       from 'fn/get.js';
import id        from 'fn/id.js';
import isDefined from 'fn/is-defined.js';
import noop      from 'fn/noop.js';
import nothing   from 'fn/nothing.js';
import overload  from 'fn/overload.js';
import remove    from 'fn/remove.js';
import create    from 'dom/create.js';
import decode    from 'dom/decode.js';
import identify  from 'dom/identify.js';

//

import safe      from './scope/safe.js';
import stash     from './stash.js';

const scope = {};

// Add Math functions to scope
const descriptors = Object.getOwnPropertyDescriptors(Math);
let name;
for (name in descriptors) scope[name] = Math[name];

export default Object.assign(scope, {
    // Built-ins added to scope with shorter names for template brevity
    root:      document.documentElement,
    body:      document.body,
    frame:     window.requestAnimationFrame,

    // Override round(n) with round(n, factor)
    round:     (value, n = 1) => Math.round(value / n) * n,

    // Sane versions of isFinite() and isNaN() from Number
    isFinite:  Number.isFinite,
    isInteger: Number.isInteger,
    isNaN:     Number.isNaN,

    // Object functions
    assign:    Object.assign,
    entries:   Object.entries,
    keys:      Object.keys,
    values:    Object.values,

    Data,
    Signal,
    args,
    cache,
    create,
    decode,
    get,
    id,
    identify,
    isDefined,
    noop,
    nothing,
    overload,
    remove,
    safe,
    stash
});

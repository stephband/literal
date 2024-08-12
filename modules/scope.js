
// Import base set of scope functions

import * as scope1 from '../scope/scope-fns.js';
import * as scope2 from '../scope/scope-dom.js';

const scope = {};

// Add Math functions to scope
const descriptors = Object.getOwnPropertyDescriptors(Math);
let name;
for (name in descriptors) scope[name] = Math[name];

export default Object.assign(scope, scope1, scope2, {
    // Override round(n) with round(n, factor)
    round:     (value, n = 1) => Math.round(value / n) * n,
    // Add the sane versions of isFinite() and isNaN() from Number
    isFinite:  Number.isFinite,
    isInteger: Number.isInteger,
    isNaN:     Number.isNaN,
    // Add Object functions
    assign:    Object.assign,
    entries:   Object.entries,
    keys:      Object.keys,
    values:    Object.values
});

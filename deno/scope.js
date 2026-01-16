

// This is the base set of scope functions. These functions are already used by
// literal so they come at no cost to have them in scope by default.

import args      from 'fn/args.js';
import cache     from 'fn/cache.js';
import get       from 'fn/get.js';
import id        from 'fn/id.js';
import isDefined from 'fn/is-defined.js';
import noop      from 'fn/noop.js';
import nothing   from 'fn/nothing.js';
import overload  from 'fn/overload.js';
import remove    from 'fn/remove.js';

import { px, em, rem } from './parse/parse-length.js';
import markdown  from './parse/parse-markdown.js';
import include   from './scope/include.js';
import comments  from './scope/comments.js';
import render    from './scope/render.js';


// Extend scope with library of functions

import by          from 'fn/by.js';
import capture     from 'fn/capture.js';
import choose      from 'fn/choose.js';
import clamp       from 'fn/clamp.js';
import equals      from 'fn/equals.js';
import exec        from 'fn/exec.js';
import last        from 'fn/last.js';
import matches     from 'fn/matches.js';
import normalise   from 'fn/normalise.js';
import denormalise from 'fn/denormalise.js';
import getPath     from 'fn/get-path.js';
import setPath     from 'fn/set-path.js';
import slugify     from 'fn/slugify.js';
import toCamelCase from 'fn/to-camel-case.js';
import deg         from 'fn/to-deg.js';
import rad         from 'fn/to-rad.js';
import wrap        from 'fn/wrap.js';
import pluralise   from '../modules/scope/pluralise.js';


export default {
    abs:      Math.abs,
    acos:     Math.acos,
    acosh:    Math.acosh,
    asin:     Math.asin,
    asinh:    Math.asinh,
    atan:     Math.atan,
    atanh:    Math.atanh,
    atan2:    Math.atan2,
    ceil:     Math.ceil,
    cbrt:     Math.cbrt,
    expm1:    Math.expm1,
    clz32:    Math.clz32,
    cos:      Math.cos,
    cosh:     Math.cosh,
    exp:      Math.exp,
    floor:    Math.floor,
    fround:   Math.fround,
    hypot:    Math.hypot,
    imul:     Math.imul,
    log:      Math.log,
    log1p:    Math.log1p,
    log2:     Math.log2,
    log10:    Math.log10,
    max:      Math.max,
    min:      Math.min,
    pow:      Math.pow,
    random:   Math.random,
    round:    Math.round,
    sign:     Math.sign,
    sin:      Math.sin,
    sinh:     Math.sinh,
    sqrt:     Math.sqrt,
    tan:      Math.tan,
    tanh:     Math.tanh,
    trunc:    Math.trunc,
    E:        Math.E,
    LN10:     Math.LN10,
    LN2:      Math.LN2,
    LOG10E:   Math.LOG10E,
    LOG2E:    Math.LOG2E,
    PI:       Math.PI,
    SQRT1_2:  Math.SQRT1_2,
    SQRT2:    Math.SQRT2,
    f16round: Math.f16round,

    // Sane versions of isFinite() and isNaN() from Number
    isFinite:  Number.isFinite,
    isInteger: Number.isInteger,
    isNaN:     Number.isNaN,

    // Object functions
    assign:    Object.assign,
    entries:   Object.entries,
    keys:      Object.keys,
    values:    Object.values,

    args,
    cache,
    get,
    id,
    isDefined,
    noop,
    nothing,
    overload,
    remove,
    px,
    em,
    rem,
    markdown,
    include,
    comments,
    render,
    by,
    capture,
    choose,
    clamp,
    equals,
    exec,
    last,
    matches,
    normalise,
    denormalise,
    getPath,
    setPath,
    slugify,
    toCamelCase,
    deg,
    rad,
    wrap,
    pluralise
}

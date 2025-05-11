

// This is the base set of scope functions. These functions are already used by
// literal so they come at no cost to have them in scope by default.

export { default as args      } from 'fn/args.js';
export { default as cache     } from 'fn/cache.js';
export { default as get       } from 'fn/get.js';
export { default as id        } from 'fn/id.js';
export { default as isDefined } from 'fn/is-defined.js';
export { default as noop      } from 'fn/noop.js';
export { default as nothing   } from 'fn/nothing.js';
export { default as overload  } from 'fn/overload.js';
export { default as remove    } from 'fn/remove.js';

// Add Math functions to scope
/*
const descriptors = Object.getOwnPropertyDescriptors(Math);
let name;
for (name in descriptors) scope[name] = Math[name];

export default Object.assign(scope, {
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
});
*/

export { px, em, rem }         from './parse/parse-length.js';
export { default as markdown } from './parse/parse-markdown.js';
export { default as include }  from './scope/include.js';
export { default as comments } from './scope/comments.js';
export { default as render }   from './scope/render.js';


// Extend scope with library of functions

export { default as by          } from 'fn/by.js';
export { default as capture     } from 'fn/capture.js';
export { default as choose      } from 'fn/choose.js';
export { default as clamp       } from 'fn/clamp.js';
export { default as equals      } from 'fn/equals.js';
export { default as exec        } from 'fn/exec.js';
export { default as last        } from 'fn/last.js';
export { default as matches     } from 'fn/matches.js';
export { default as normalise   } from 'fn/normalise.js';
export { default as denormalise } from 'fn/denormalise.js';
export { default as getPath     } from 'fn/get-path.js';
export { default as setPath     } from 'fn/set-path.js';
export { default as slugify     } from 'fn/slugify.js';
export { default as toCamelCase } from 'fn/to-camel-case.js';
export { default as deg         } from 'fn/to-deg.js';
export { default as rad         } from 'fn/to-rad.js';
export { default as wrap        } from 'fn/wrap.js';
export { default as pluralise   } from '../modules/scope/pluralise.js';


// Extend scope with library of pure and DOM functions

import Literal       from './module.js';
import * as scopeFn  from './scope/scope-fns-ext.js';
import * as scopeDom from './scope/scope-dom-ext.js';

Object.assign(Literal.scope, scopeFn, scopeDom);


import Data    from 'fn/data.js';
import Signal  from 'fn/signal.js';
import Literal from './modules/literal.js';
import scope   from './modules/scope.js';
import { compiled } from './modules/compile/compile.js';

Literal.scope  = scope;

export { Literal as default, Data, Signal, compiled };
export { default as config } from './modules/config.js';
export { urls }              from './modules/urls.js';

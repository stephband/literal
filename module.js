
import Template     from './modules/template.js';
import include      from './modules/include.js';
import stash        from './modules/stash.js';
import scope        from './modules/scope.js';
import { compiled } from './modules/compile/compile.js';

Template.scope    = scope;
Template.stash    = stash;
Template.include  = include;
Template.compiled = compiled;

export default Template;

export { default as config } from './modules/config.js';
export { default as Data }   from 'fn/data.js';
export { default as Signal } from 'fn/signal.js';
export { urls }              from './modules/urls.js';

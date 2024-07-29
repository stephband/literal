
import Template     from './modules/template.js';
import scope        from './modules/scope.js';
import { compiled } from './modules/compile/compile.js';

Template.scope    = scope;
Template.compiled = compiled;

export default Template;

export { default as config } from './modules/config.js';
export { default as Data }   from 'fn/data.js';
export { default as Signal } from 'fn/signal.js';
export { urls }              from './modules/urls.js';

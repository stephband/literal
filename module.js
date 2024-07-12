
import Template from './modules/template.js';
import scope           from './modules/scope.js';

Template.scope = scope;

export default Template;

export { compiled }          from './modules/compile/compile.js';
export { default as config } from './modules/config.js';
export { default as Data }   from '../fn/modules/signal-data.js';
export { default as Signal } from '../fn/modules/signal.js';
export { urls }              from './modules/urls.js';

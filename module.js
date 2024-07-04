

import TemplateRenderer from './modules/template-renderer.js';

export default function Literal(template) {
    // TODO: I don't think this works for accessign existing literal-html renderers,
    // which is what we want to do. Instead it creates a new renderer...

    template = typeof template === 'string' ?
        document.getElementById(template.slice(1)) :
        template ;

    return new TemplateRenderer(template);
}

// TODO: Legacy, remove
export { TemplateRenderer as Renderer };

export { compiled }          from './modules/compile/compile.js';
export { default as config } from './modules/config.js';
export { default as Data }   from '../fn/modules/signal-data.js';
export { default as scope }  from './modules/scope.js';
export { urls }              from './modules/urls.js';

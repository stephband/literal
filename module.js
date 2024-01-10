

import TemplateRenderer from './modules/renderer-template.js';

export default function Literal(template) {
    // TODO: I don't think this works for accessign existing literal-html renderers,
    // which is what we want to do. Instead it creates a new renderer...

    template = typeof template === 'string' ?
        document.getElementById(template) :
        template ;

    return new TemplateRenderer(template);
}

// TODO: Legacy, remove
export { TemplateRenderer as Renderer };

export { compiled }                 from './modules/renderer/compile.js';
export { default as config }        from './modules/config.js';
export { default as Data, observe } from './modules/data.js';
export { default as scope }         from './modules/scope.js';
export { urls }                     from './modules/urls.js';

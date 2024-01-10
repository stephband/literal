

import TemplateRenderer, { cache } from './modules/renderer-template.js';

export default function Literal(id) {
    // TODO: I don't think this works, it replaces whatever template is in the
    // DOM, it it probably isn't in the DOM if it's cached?

    const id = typeof id === 'object' ?
        id.id || '' :
        id ;

    if (cache[id]) {
        return cache[id].create();
    }

    const template = typeof id === 'object' ?
        id :
        document.getElementById(id) ;

    return new TemplateRenderer(template) ;
}

// TODO: Legacy, remove
export { TemplateRenderer as Renderer };

export { compiled }                 from './modules/renderer/compile.js';
export { default as config }        from './modules/config.js';
export { default as Data, observe } from './modules/data.js';
export { default as scope }         from './modules/scope.js';
export { urls }                     from './modules/urls.js';

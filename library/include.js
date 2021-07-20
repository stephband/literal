
/** 
include(url, data)
**/

import curry from '../../fn/modules/curry.js';
import request from './request.js';
import TemplateRenderer from '../modules/renderers/template-renderer.js';

export function include(url, data) {
    if (!/^#/.test(url)) {
        throw new Error('Template: Only #fragment identifiers currently supported as include() urls ("' + url + '")');
    }

    const renderer = new TemplateRenderer(url.slice(1));

    // Accept a url, fetch or import it before rendering
    if (typeof data === 'string') {
        request(data).then((data) => renderer.render(data));
    }
    // Accept a promise of data
    else if (data.then) {
        data.then((data) => renderer.render(data));
    }
    // Accept an object or undefined
    else {
        renderer.render(data || {});
    }

    return renderer;
}

export default curry(include);

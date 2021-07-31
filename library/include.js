
/** 
include(url, data)
**/

import curry from '../../fn/modules/curry.js';
import request from './request.js';
import TemplateRenderer from '../modules/renderers/template-renderer.js';

export function include(url, data) {
    if (!/^#/.test(url)) {
        throw new Error('Literal include() - Only #fragment identifiers currently supported as template src ("' + url + '")');
    }

    const renderer = new TemplateRenderer(url.slice(1));
    const first    = renderer.first;

    // Accept a url, fetch or import it before rendering
    if (typeof data === 'string') {
        request(data).then((data) => first.after(renderer.render(data)));
        return first;
    }

    // Accept a promise of data
    if (data.then) {
        data.then((data) => first.after(renderer.render(data)));
        return first;
    }

    // Accept an object or undefined
    return renderer.render(data || {});
}

export default curry(include);

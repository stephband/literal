
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
    const last     = renderer.last;

    // Accept a url, fetch or import it before rendering
    if (typeof data === 'string') {
        request(data).then((data) => last.before(renderer.render(data)));
        return last;
    }

    // Accept a promise of data
    if (data.then) {
        data.then((data) => last.before(renderer.render(data)));
        return last;
    }

    // Accept an object or undefined
    return renderer.render(data || {});
}

export default curry(include);


/** include(src, data)
Includes another template. Not available inside attributes.
**/

import curry            from '../../fn/modules/curry.js';
import request          from './request.js';
import { requestGet }   from '../../dom/modules/request.js';
import fragmentFromHTML from '../../dom/modules/fragment-from-html.js';
import TemplateRenderer from '../modules/renderers/template-renderer.js';
import { getTarget }    from '../../fn/observer/observer.js';

export function include(url, object) {
    // This is for inserting static HTML for living archives, but the API
    // should be different for static HTML
    if (typeof url === 'string' && !/^#/.test(url)) {
        return requestGet(url)
        .then(fragmentFromHTML);
    }

    // arguments[2] is a workaround for lack of reference to context element.
    // The Todo for this is here:
    // https://github.com/stephband/literal/issues/2
    const renderer = new TemplateRenderer(typeof url === 'string' ? url.slice(1) : url);

    // Accept a url, fetch or import it before rendering
    if (typeof object === 'string') {
        return request(object)
        .then((data) => renderer.push(data))
        .then(() => renderer);
    }

    // Operate on target to be sure we are not registering gets for data.then 
    // in parent renderer 
    const data = getTarget(object);
    
    // Accept a promise of data
    if (data && data.then) {
        return data
        .then((data) => renderer.push(data))
        .then(() => renderer);
    }

    // Cue the renderer so that we do not end up collecting read paths read by
    // the child renderer in the parent.
    return renderer
    .push(data || {})
    .then(() => renderer);
}

export default curry(include);

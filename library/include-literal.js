
/** include(src, data)
Includes another template. Not available inside attributes.
**/

import { requestGet }   from '../../dom/modules/request.js';
import { getTarget }    from '../../fn/observer/observer.js';
import TemplateRenderer from '../renderers/template-renderer.js';
import request          from './request.js';

export default function include(url, object, element) {
    if (typeof url === 'string' && !/^#/.test(url)) {
        throw new Error('include() external url not yet supported, #fragment identifiers only');
    }

    // Currently we accept string URLs in the form '#id' only
    const renderer = new TemplateRenderer(typeof url === 'string' ? url.slice(1) : url, element);

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


/** include(src, data)
Includes another template. Not available inside attributes.
**/

import { getTarget }    from '../../fn/observer/observer.js';
import TemplateRenderer from '../modules/renderer-template.js';
import requestData      from '../modules/request-data.js';

export default function include(url, object, element) {
    if (typeof url === 'string' && !/^#/.test(url)) {
        throw new Error('include() external url not yet supported, #fragment identifiers only');
    }

    // Currently we accept string URLs in the form '#id' only
    const renderer = new TemplateRenderer(
        typeof url === 'string' ? document.getElementById(url.slice(1)) : url,
        element
    );

    // Accept a url, fetch or import it before rendering
    if (typeof object === 'string') {
        return requestData(object)
        .then((data) => {
            renderer.push(data);
            return renderer
        });
    }

    // Operate on target to be sure we are not registering gets for data.then
    // in parent renderer
    const data = getTarget(object);

    // Accept a promise of data
    if (data && data.then) {
        return data
        .then((data) => {
            renderer.push(data);
            return renderer
        });
    }

    // Cue the renderer so that we do not end up collecting read paths read by
    // the child renderer in the parent.
    renderer.push(data || {});
    return renderer;
}



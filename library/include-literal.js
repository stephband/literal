
/**
include(src, data)
Includes another template. Not available inside attributes.
**/

import { getTarget }    from '../../fn/observer/observer.js';
import TemplateRenderer from '../modules/renderer-template.js';
import getTemplate      from '../modules/get-template.js';
import requestTemplate  from '../modules/request-template.js';
import requestData      from '../modules/request-data.js';

function push(template, data, element) {
    const renderer = new TemplateRenderer(template, element);
    renderer.push(data);
    return renderer;
}

export default function include(src, data, element) {
    // Operate on target to be sure we are not registering gets in
    // parent renderer
    const object = getTarget(data);

    if (/^#/.test(src)) {
        const template = getTemplate(src);
        const dataRequest = typeof object === 'string' ? requestData(object) :
            object && object.then ? object :
            null;

        if (dataRequest) {
            return dataRequest.then((data) => push(template, data, element));
        }

        return push(template, data || {}, element);
    }

    const templateRequest = requestTemplate(src);
    const dataRequest = typeof object === 'string' ?
        requestData(object) :
        object ;

    return Promise
    .all([templateRequest, dataRequest])
    .then(([template, data]) => push(template, data, element));
}



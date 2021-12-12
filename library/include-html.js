
/**
includeHTML(src)
Includes another template. Not available inside attributes.
**/

import create         from '../../dom/modules/create.js';
import { requestGet } from '../../dom/modules/request.js';

export default function includeHTML(url) {
    if (!/^#/.test(url)) {
        return requestGet(url).then((html) => create('fragment', html));
    }

    if (url.length < 2) {
        throw new Error('hash identifier empty ' + url);
    }

    const id       = url.slice(1);
    const template = document.getElementById(id);

    if (!template) {
        throw new Error('template not found ' + url);
    }

    return template.content ?
        // Clone template content
        template.content.cloneNode(true) :
        // Clone element children /*, pass in template as context? */
        create('fragment', template.cloneNode(true).childNodes /*, template*/) ;
}

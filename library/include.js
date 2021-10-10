
/** include(src, data)
Includes another template. Not available inside attributes.
**/

import curry            from '../../fn/modules/curry.js';
import request          from './request.js';
import create           from '../../dom/modules/create.js';
import { requestGet }   from '../../dom/modules/request.js';
import fragmentFromHTML from '../../dom/modules/fragment-from-html.js';
import TemplateRenderer from '../modules/renderers/template-renderer.js';
import { getTarget }    from '../../fn/observer/observer.js';
import print            from './print.js';

export function include(url, data) {
    if (!/^#/.test(url)) {
        // Plonk raw HTML as a fragment into the DOM
        const marker = create('text', '');
        requestGet(url).then((html) => marker.after(fragmentFromHTML(html)));
        return marker;

        //throw new Error('Literal include() - Only #fragment identifiers currently supported as template src ("' + url + '")');
    }

    const renderer = new TemplateRenderer(url.slice(1));
    const marker   = renderer.first;
    marker.stop    = () => renderer.stop();
    marker.remove  = () => renderer.remove();

    // Accept a url, fetch or import it before rendering
    if (typeof data === 'string') {
        request(data)
        .then((data) => renderer.render(data))
        .then(() => marker.after(renderer.content))
        .catch(print);

        return marker;
    }

    // Operate on target to be sure we are not registering gets for data.then 
    // in parent renderer 
    data = getTarget(data);
    
    // Accept a promise of data
    if (data && data.then) {
        data
        .then((data) => renderer.render(data))
        .then(() => marker.after(renderer.content))
        .catch(print);

        return marker;
    }

    // Cue the renderer so that we do not end up collecting read paths read by
    // the child renderer in the parent.
    renderer
    .render(data || {})
    .then(() => marker.after(renderer.content))
    .catch(print);

    return marker;
}

export default curry(include);

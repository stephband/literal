
/** 
include(url, data)
**/

import curry from '../../fn/modules/curry.js';
import request from './request.js';
import create from '../../dom/modules/create.js';
import { requestGet } from '../../dom/modules/request.js';
import { fragmentFromHTML } from '../../dom/modules/fragments.js';
import TemplateRenderer from '../modules/renderers/template-renderer.js';

export function include(url, data) {
    if (!/^#/.test(url)) {
        // Plonk raw HTML as a fragment into the DOM
        const marker = create('text', '');
        requestGet(url).then((html) => marker.before(fragmentFromHTML(html)));
        return marker;

        //throw new Error('Literal include() - Only #fragment identifiers currently supported as template src ("' + url + '")');
    }

    const renderer = new TemplateRenderer(url.slice(1));
    const marker   = renderer.last;
    marker.stop = () => renderer.stop();
    marker.remove = () => renderer.remove();

    //console.log('include', url, data);

    // Accept a url, fetch or import it before rendering
    if (typeof data === 'string') {
        request(data).then((data) => renderer.cue(data)).then(() => marker.before(renderer.content));
        return marker;
    }

    // Accept a promise of data
    if (data && data.then) {
        data.then((data) => renderer.cue(data)).then(() => marker.before(renderer.content));
        return marker;
    }

    // Accept an object or undefined and render immediately, returning content
    return renderer.render(data || {});
}

export default curry(include);

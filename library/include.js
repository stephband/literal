
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
        const last = create('text', '');
        requestGet(url).then((html) => last.before(fragmentFromHTML(html)));
        return last;

        //throw new Error('Literal include() - Only #fragment identifiers currently supported as template src ("' + url + '")');
    }

    const renderer = new TemplateRenderer(url.slice(1));
    const last     = renderer.last;
//console.log('include', url, data);
    // Accept a url, fetch or import it before rendering
    if (typeof data === 'string') {
        return request(data).then((data) => renderer.cue(data)).then(() => renderer.content);
    }

    // Accept a promise of data
    if (data.then) {
        return data.then((data) => renderer.cue(data)).then(() => renderer.content);
    }

    // Accept an object or undefined
    return renderer.render(data || {});
}

export default curry(include);

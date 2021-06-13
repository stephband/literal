
import curry from '../../fn/modules/curry.js';
import requestData from './request-data.js';
import TemplateRenderer from './renderers/template-renderer.js';

export function include(url, data) {
    if (!/^#/.test(url)) {
        throw new Error('Template: Only #fragment identifiers currently supported as include() urls ("' + url + '")');
    }

    const renderer = new TemplateRenderer(url.slice(1));

    // Where data is a url, fetch or import it before rendering
    if (typeof data === 'string') {
        requestData(data).then((data) => renderer.render(data));
    }
    else {
        renderer.render(data || {});
    }

    return renderer;
}

export default curry(include);

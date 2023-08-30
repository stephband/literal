
import cache          from '../../fn/modules/cache.js';
import { requestGet } from '../../dom/modules/request.js';

export default cache(function requestTemplate(url) {
    return requestGet(url).then((fragment) => {
        // If the URL had a hash, search for element witht he id of the hash
        const location = new URL(url, window.location);
        const element  = location.hash ?
            fragment.querySelector(location.hash) :
            fragment ;

        return {
            id: url,
            // If element is a template grab its content fragment
            content: element.content || element
        };
    });
});

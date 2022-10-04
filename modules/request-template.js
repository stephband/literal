
import cache          from '../../fn/modules/cache.js';
import create         from '../../dom/modules/create.js';
import { requestGet } from '../../dom/modules/request.js';

export default cache(function requestTemplate(url) {
    return requestGet(url).then((html) => ({
        id: url,
        content: create('fragment', html)
    }));
});


import delegate                from '../../dom/modules/delegate.js';
import events                  from '../../dom/modules/events.js';
import request                 from '../../dom/modules/request.js';
import { trigger }             from '../../dom/modules/trigger.js';
import { px, em, rem, vw, vh } from '../../dom/modules/parse-length.js';
import library                 from './library.js';


// Export a library with DOM functions.

export default Object.assign({
    delegate,
    events,
    request,
    trigger,
    px,
    em,
    rem,
    vw,
    vh
}, library);

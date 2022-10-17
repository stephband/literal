
import events                  from '../../dom/modules/events.js';
import { trigger }             from '../../dom/modules/trigger.js';
import { px, em, rem, vw, vh } from '../../dom/modules/parse-length.js';
import library                 from './library.js';


// Export a library with DOM functions. There are some functions that it costs
// nothing to include as they are already used by Literal.

export default Object.assign({
    events,
    trigger,
    px,
    em,
    rem,
    vw,
    vh
}, library);

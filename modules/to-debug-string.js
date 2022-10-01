
import noop from '../../fn/modules/noop.js';

const createErrorString = window.DEBUG ?
    (source, element, template) => {
        const text = source.trim();
        const truncated = text.length > 32 ?
            text.slice(0, 30).replace(/\s+/g, ' ') + ' …' :
            text.replace(/\s+/g, ' ') ;

        return ' in template #' + template.id
            + (element && element.tagName ? ', <' + element.tagName.toLowerCase() + (name ? ' ' + name + '="' + truncated + '">' : '>') : '') ;
    } :
    noop ;

export default createErrorString;

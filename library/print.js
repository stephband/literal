
import { getTarget }     from '../modules/observer.js';

function toHTML(object) {
    // Print different kinds of objects differently
    if (typeof object === 'object' && object.template) {
        return '<strong>' + object.id + '.' + object.count + '</strong> #' + object.template + ' <small>' + object.path + '</small>';
    }

    if (typeof object === 'object' && object.message) {
        return '<code class="red-bg white-fg"><strong>' + object.constructor.name + '</strong> ' + object.message + '</code>';
    }

    if (typeof object === 'object') {
        return '<code><strong>' + object.constructor.name + '</strong> ' + JSON.stringify(object) + '</code>';
    }
}

export default function print() {
    // Print renderer
    const pre = document.createElement('pre');

    pre.setAttribute('class',
        (arguments.length === 1 && arguments[0].message ? 'literal-error-message ' : '') +
        'literal-message'
    );

    let html = '', n = -1;
    while (arguments[++n] !== undefined) {
        html += toHTML(getTarget(arguments[n]));
    }
    pre.innerHTML = html;
    return pre;
}


import { getTarget }     from '../modules/observer.js';

function toHTML(object) {
    // Print different kinds of objects differently
    if (typeof object === 'object' && object.template) {
        return '<strong>' + object.id + '.' + object.count + '</strong> #' + object.template + ' <small>' + object.path + '</small>';
    }

    if (typeof object === 'object') {
        return '<code><strong>' + object.constructor.name + '</strong> ' + JSON.stringify(object) + '</code>';
    }
}

export default function print(object) {
    // Print renderer
    const pre = document.createElement('pre');
    pre.setAttribute('class', 'literal-debug-message');
    let html = '', n = -1;
    while (arguments[++n] !== undefined) {
        html += toHTML(getTarget(arguments[n]));
    }
    pre.innerHTML = html;
    return pre;
}

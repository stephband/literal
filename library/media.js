
import { register } from '../modules/library.js';
import create  from '../../dom/modules/create.js';
import media   from '../../dom/modules/media.js';
import { log } from '../modules/log.js';

const DEBUG = window.DEBUG && (window.DEBUG === true || window.DEBUG.includes('routes'));

const assign = Object.assign;

export default register('media', function(selector, inside, outside) {
    const marker = create('text', '');
    let node;

    media(selector, function enter() {
console.log('ENTER');
        node && node.stop && node.stop();
        node && node.remove();
        node = inside();
        marker.after(node);
    }, function exit() {
console.log('EXIT');
        node && node.stop && node.stop();
        node && node.remove();
        if (!outside) { return; }
        node = outside();
        console.log('EXIT ', node);
        marker.after(node);
    });
console.log('RETURN');
    return marker;
});

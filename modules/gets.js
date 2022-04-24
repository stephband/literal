
import { remove } from '../../fn/modules/remove.js';
import Producer   from '../../fn/modules/stream/producer.js';
import Stream     from '../../fn/modules/stream.js';
import { getTrap, getTarget } from '../../fn/observer/observer.js';

//const DEBUG = window.DEBUG === true;

const assign = Object.assign;
const values = Object.values;

/**
reads(object)
Calls `fn` for every property of `object` read via a get operation. Returns an
object with the method `.stop()`.
**/

function stop(gets) {
    gets.stop();
}

function GetProducer(target, path, root) {
    this.children = {};

    // For some reason child proxies are being set... dunno how...
    this.target = getTarget(target);
    this.path   = path;
    this.root   = root;
}

assign(GetProducer.prototype, Producer.prototype, {
    pipe: function(root) {
        this[0] = this.root = root;
        getTrap(this.target).gets.push(this);
    },

    listen: function(key) {
        // We may only create one child observer per key
        if (this.children[key]) { return; }
        const path = this.path ? this.path + '.' : '';
        this.children[key] = new GetProducer(this.target[key], path + key, this.root);
    },

    unlisten: function(key) {
        // Can't unobserve the unobserved
        if (!this.children[key]) { return; }
        this.children[key].stop();
        delete this.children[key];
    },

    push: function(key) {
        const path = this.path ? this.path + '.' : '';
        // Pass concatenated path to parent fn
        this.root[0].push(path + key);
    },

    stop: function() {
        remove(getTrap(this.target).gets, this);
        values(this.children).forEach(stop);
        if (this[0]) {
            Producer.prototype.stop.apply(this, arguments);
        }
    }
});

export default function gets(observer) {
    return new Stream(new GetProducer(observer, ''));
}


import { remove }             from '../../fn/modules/remove.js';
import Stream, { stop }       from '../../fn/modules/stream/stream.js';
import { getTrap, getTarget } from '../../fn/observer/observer.js';

//const DEBUG = window.DEBUG === true;

const assign = Object.assign;
const values = Object.values;

/**
gets(object)
Calls `fn` for every property of `object` read via a get operation. Returns an
object with the method `.stop()`.
**/

function invokeStop(object) {
    object.stop();
}

function GetProducer(target, path) {
    this.children = {};

    // For some reason child proxies are being set... dunno how...
    this.target = getTarget(target);
    this.path   = path;
}

assign(GetProducer.prototype, {
    pipe: function(root) {
        this[0] = this.root = root;
        getTrap(this.target).gets.push(this);

        // If this is the root producer listen for stream stop
        if (this.path === '') {
            this[0].done(this);
        }
    },

    listen: function(key) {
        // We may only create one child observer per key
        if (this.children[key]) { return; }
        const path     = (this.path ? this.path + '.' : '') + key;
        const producer = this.children[key] = new GetProducer(this.target[key], path);
        producer.pipe(this.root);
    },

    unlisten: function(key) {
        // Can't unobserve the unobserved
        if (!this.children[key]) { return; }
        this.children[key].stop();
        delete this.children[key];
    },

    push: function(key) {
        const path = (this.path ? this.path + '.' : '') + key;
//console.log('.push()', path);
        // Pass concatenated path to parent fn
        this.root[0].push(path);
    },

    stop: function() {
        remove(getTrap(this.target).gets, this);
        values(this.children).forEach(invokeStop);

        // If this is the root producer stop the stream
        if (this.path === '') {
            stop(this[0]);
        }
    }
});

export default function gets(observer) {
    return new Stream(new GetProducer(observer, ''));
}

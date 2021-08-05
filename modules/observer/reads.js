
import { remove, getTarget, $observer } from './observer.js';

//const DEBUG = window.DEBUG === true;

const assign = Object.assign;
const values = Object.values;

/** 
reads(object, fn)
Calls `fn` for every property of `object` read via a get operation. Returns an
object with the method `.stop()`.
**/

function stop(gets) {
    gets.stop();
}

function ChildGets(target, path, parent, output) {
    this.children = {};

    // For some reason child proxies are being set... dunno how...
    this.target   = getTarget(target);
    this.parent   = parent;
    this.path     = path;
    this.output   = output;

    target[$observer].gets.push(this);
}

assign(ChildGets.prototype, {
    listen: function(key) {
        // We may only create one child observer per key
        if (this.children[key]) { return; }
        const path = this.path ? this.path + '.' : '';
        this.children[key] = new ChildGets(this.target[key], path + key, this, this.output);
    },

    unlisten: function(key) {
        // Can't unobserve the unobserved
        if (!this.children[key]) { return; }
        this.children[key].stop();
        delete this.children[key];
    },

    fn: function(key) {
        const path = this.path ? this.path + '.' : '';
        // Pass concated path to parent fn
        this.output(path + key);
    },

    stop: function() {
        remove(this.target[$observer].gets, this);
        values(this.children).forEach(stop);
    }
});

function Gets(target, done) {
    this.children = {};
    this.target   = target;
    this.done     = done;
    this.path     = '';

    this.output = (path) => {
        this.fnEach && this.fnEach(path);
    };

    target[$observer].gets.push(this);
}

assign(Gets.prototype, ChildGets.prototype, {
    each: function(fn) {
        this.fnEach = fn;
        return this;
    },

    stop: function() {
        ChildGets.prototype.stop.apply(this);
        this.fnDone && this.fnDone();
    }
});

export default function reads(observer) {
    return new Gets(getTarget(observer));
}

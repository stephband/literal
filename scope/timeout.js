
class Timeout {
    constructor(time, fn) {
        this.timer = setTimeout(fn, time * 1000);
    }

    stop() {
        clearTimeout(this.timer);
    }
}

/**
timeout(time, fn)
Calls `fn` after `time` seconds. Returns an object with a `.stop()` method that
clears the timeout.
**/

export default function timeout(time, fn) {
    return new Timeout(time, fn);
}

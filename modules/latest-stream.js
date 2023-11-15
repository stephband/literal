
import Stream, { pipe } from '../../fn/modules/stream/stream.js';

const assign = Object.assign;
const create = Object.create;


/*
LatestStream(values)
A LatestStream may be pushed to before it is piped.
*/

function push(value) {
    // Store latest pushed value
    if (value === undefined) { return; }
    this.value = value;
}

export default function LatestStream() {
    this.push = push;
}

LatestStream.prototype = assign(create(Stream.prototype), {
    pipe: function(output) {
        pipe(this, output);
        if (this.value !== undefined) { output.push(this.value); }
        delete this.push;
        return output;
    }
});

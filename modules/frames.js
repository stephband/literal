
import Stream, { stop, push } from '../../fn/modules/stream/stream.js';

const assign = Object.assign;
const create = Object.create;


/*
FramesStream(fn)
A FramesStream is a readable stream of values produced by `fn(push, stop)`,
which is called when the stream is first consumed.
*/

function FramesStream() {

}

FramesStream.prototype = assign(create(Stream.prototype), {
    pipe: function(output) {
        // Connect stream to output
        output.done(this);
        this[0] = output;

        // Start frame counter
        const self = this;
        this.frame = requestAnimationFrame(function frame(frametime) {
            push(output, frametime);
            self.frame = requestAnimationFrame(frame);
        });

        // Return output stream
        return output;
    },

    stop: function() {
        concelAnimationFrame(this.frame);
        stop(this);
        return this;
    }
});



export default frames.broadcast();

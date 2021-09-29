
import Stream from './stream.js';

const assign = Object.assign;

export function Combine(streams) {
    return new Stream((push) => {
        const values = {};
        let i = -1, stream;
        while (stream = streams[++i]) {
            const n = i;
            stream.each((value) => {
                values[n] = value;
                push(assign({}, values));
            });
        }
    });
}

export default function combine() {
    return Combine(arguments);
}

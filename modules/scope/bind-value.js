
import id     from '../../../fn/modules/id.js';
import set    from '../../../fn/modules/set.js';
import events from '../../../dom/modules/events.js';
import { observe } from '../data.js';

const fromTypes = {
    number:  Number,
    range:   Number
};


function fromTypedValue(e) {
    const type  = e.target.type;
    const value = e.target.value;
    return fromTypes[type] ?
        fromTypes[type](value) :
        value ;
}

export default function bindValue(element, data, path, to, from, setValue) {
    const inputs = events('input', element)
        // Parse as type
        .map(fromTypedValue)
        // Transform
        .map(from)
        // Set value on data
        .each(set(path, data));

    return observe(path, data)
        // Transform
        .map(to)
        // Set value on input
        .each((value) => setValue(element, value))
        // Unbind inputs when observe stream is stopped
        .done(inputs);
}

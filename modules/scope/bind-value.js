
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
    console.warn('Literal: you are using the function bind(). This is experimental and the API may change.');

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
        // Set value on input, bypassing usual renderer.compose()
        .each((value) => setValue(element, value))
        // Unbind events when observe stream is stopped
        .done(inputs);
}

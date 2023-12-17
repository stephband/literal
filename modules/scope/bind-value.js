
import id     from '../../../fn/modules/id.js';
import set    from '../../../fn/modules/set.js';
import events from '../../../dom/modules/events.js';
import { getValue, setValue } from '../renderer/value.js';
import { observe } from '../data.js';

let warned;

function getTargetValue(e) {
    return getValue(e.target);
}

export default function bindValue(element, data, path, to, from, setValue) {
    if (window.DEBUG && !warned) {
        warned = true;
        console.warn('Literal: you are using the template function bind(). This is experimental and the API may change. Currently only single key paths are supported, not compound.paths.');
    }

    const inputs = events('input', element)
        // Get Literal's idea of the input value
        .map(getTargetValue)
        // Transform
        .map(from)
        // Set value on data
        .each(set(path, data));

    return observe(path, data)
        // Transform
        .map(to)
        // Unbind events when observe stream is stopped
        .done(inputs);
}


import id        from '../../../fn/modules/id.js';
import isDefined from '../../../fn/modules/is-defined.js';
import set       from '../../../fn/modules/set.js';
import events    from '../../../dom/modules/events.js';
//import { observe } from '../data.js';

export default function bindChecked(element, data, path, to, from, setChecked) {
    console.warn('Literal: you are using the function bind(). This is experimental and the API may change.');

    const attribute = element.getAttribute('value');
    const defined   = isDefined(attribute);

    const inputs = events('input', element)
        // Transform
        .map(defined ?
            (e) => from(e.target.checked ? attribute : undefined) :
            (e) => from(e.target.checked)
        )
        // Set value on data
        .each(set(path, data));

    return observe(path, data)
        // Transform
        .map(to)
        // Set checked on input, bypassing usual renderer.compose()
        .each(defined ?
            (value) => setChecked(element, v + '' === attribute) :
            (value) => setChecked(element, !!value)
        )
        // Unbind events when observe stream is stopped
        .done(inputs);
}

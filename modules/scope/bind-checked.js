
import id        from '../../../fn/modules/id.js';
import isDefined from '../../../fn/modules/is-defined.js';
import set       from '../../../fn/modules/set.js';
import events    from '../../../dom/modules/events.js';
import { observe } from '../data.js';

export default function bindChecked(element, data, path, to, from, setChecked) {
    const attribute = element.getAttribute('value');
    const defined   = isDefined(attribute);
    const inputs = events('input', element)
        // Parse as type
        .map(defined ?
            (e) => (e.target.checked ? attribute : undefined) :
            (e) => (e.target.checked)
        )
        // Transform
        .map(from)
        // Set value on data
        .each(set(path, data));

    return observe(path, data)
        // Transform
        .map(to)
        // Set checked on input
        .each(defined ?
            (value) => setChecked(element, v + '' === attribute) :
            (value) => setChecked(element, !!value)
        )
        // Unbind inputs when observe stream is stopped
        .done(inputs);
}

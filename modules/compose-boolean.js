
import sum from '../../fn/modules/sum.js';

export default function composeBoolean(values) {
    values = Array.from(values);

    // Sum the strings in values[0], ignoring spaces
    values[0] = !!values[0]
        .join(' ')
        .trim()
        .split(/\s+/)
        .map(Boolean)
        .reduce(sum);

    // Sum all values
    return !!values
        .map(Boolean)
        .reduce(sum);
}

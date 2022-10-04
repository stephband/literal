
import sum from '../../fn/modules/sum.js';

export default function composeBoolean(values) {
    values = Array.from(values);

    // Ignore space in the attribute
    values[0] = !!values[0]
        .join(' ')
        .trim()
        .split(/\s+/)
        .map(Boolean)
        .reduce(sum);

    // But not from the literal values
    return !!values
        .map(Boolean)
        .reduce(sum);
}

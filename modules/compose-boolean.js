
import sum from '../../fn/modules/sum.js';

export default function composeBoolean(values) {
    values = Array.from(values);

    values[0] = values[0]
        .join(' ')
        .trim()
        .split(/\s+/)
        .map(Boolean)
        .reduce(sum);

    return values
        .map(Boolean)
        .reduce(sum);
}

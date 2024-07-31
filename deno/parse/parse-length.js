
import id         from 'fn/id.js';
import overload   from 'fn/overload.js';
import parseValue from 'fn/parse-value.js';
import toType     from 'fn/to-type.js';

/**
px(value)
Takes number in pixels or a CSS length as a string and returns a numeric value
in px.
**/

export const px = overload(toType, {
    'number': id,

    'string': parseValue({
        'px': (n) => n,
        'em': (n) => 16 * n,
        'rem': (n) => 16 * n,
        catch: (n, unit) => {
            if (Number.isNaN(n)) {
                throw new Error('Invalid CSS length NaN');
            }

            if (unit) {
                throw new Error('Invalid CSS length value: ' + n + ' unit: ' + unit);
            }

            return n;
        }
    })
});

/**
em(value)
Takes number in pixels or a CSS length as a string and returns a numeric value
in px.
**/

export function em(n) {
    return px(n) / 16;
}

/**
rem(value)
Takes number in pixels or a CSS length as a string and returns a numeric value
in px.
**/

export function rem(n) {
    return px(n) / 16;
}

const rempty = /^\s*$/;

function addValue(result, value) {
    return result === undefined ?
        value :
        result + value ;
}

export default function composeValue(values) {
    const strings = values[0];
    let value = rempty.test(strings[0]) ? undefined : strings[0];
    let n = 0;

    while (strings[++n] !== undefined) {
        value = addValue(value, values[n]);

        if (!rempty.test(strings[n])) {
            value = addValue(value, strings[n]);
        }
    }

    return value;
}

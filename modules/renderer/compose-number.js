
export default function composeNumber(values) {
    const strings = values[0];

    let n = 0;
    let string = strings[n];

    while (strings[++n] !== undefined) {
        // Append to string
        string += values[n] + strings[n];
    }

    return Number(string);
}

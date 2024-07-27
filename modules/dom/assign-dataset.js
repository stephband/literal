
function parseData(value) {
    try {
        return JSON.parse(value);
    }
    catch(e) {
        return value;
    }
}

export default function assignDataset(object, dataset) {
    const keys   = Object.keys(dataset);
    const values = Object.values(dataset);

    return values
    .map(parseData)
    .reduce((object, value, i) => (object[keys[i]] = value, object), object);
}

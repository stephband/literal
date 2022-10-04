export default function truncate(n, source) {
    const text = source.trim().replace(/\s+/g, ' ');
    return text.length > n ?
        text.slice(0, n - 3) + ' … ' :
        text ;
}

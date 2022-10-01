export default function truncate(n, source) {
    const text = source.trim();
    return text.length > n ?
        text.slice(0, n - 2).replace(/\s+/g, ' ') + ' …' :
        text.replace(/\s+/g, ' ') ;
}

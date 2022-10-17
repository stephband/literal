
const entries = Object.entries;
const map     = {};

function toMap(urls, [path1, path2]) {
    const url = new URL(path1, window.location);
    urls[url] = new URL(path2, window.location);
    return urls;
}

export function urls(object) {
    entries(object).reduce(toMap, map);
}

export function rewriteURL(path) {
    // Rewrite relative import URLs to be absolute, taking the page as their
    // relative root (if we don't do this import() assumes the location of
    // the script as relative root).
    const url = new URL(path, window.location);

    // Are we rewriting this URL?
    return map[url] || url;
}

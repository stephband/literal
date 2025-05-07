
export default function translate(key) {
    if (window.DEBUG && !window.translations) {
        console.warn('Literal translate() - no `window.translations` object');
    }

    return window.translations && window.translations[key] || key;
}

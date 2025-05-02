export default function removeRange(first, last) {
    if (window.DEBUG && first.parentNode !== last.parentNode) {
        throw new Error('first and last not children of same parent')
    }

    if (first === last) {
        if (window.DEBUG) ++stats.remove;
        return last;
    }

    // Select range of nodes managed by this template
    const range = new Range();
    range.setStartBefore(first);
    range.setEndAfter(last);

    // Remove range content from DOM
    // THIS DOES NTO DO WHAT WE THINK IT DOES!!!!!! IT CLONES NODES!!!
    return range.extractContents();
}

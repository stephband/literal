
export default function deleteRange(first, last) {
    if (window.DEBUG && first.parentNode !== last.parentNode) {
        throw new Error('deleteRange: first and last not children of same parent')
    }

    if (first === last) {
        last.remove();
        return;
    }

    // Select range of nodes and remove
    const range = new Range();
    range.setStartBefore(first);
    range.setEndBefore(last);
    range.deleteContents();
}


export default function removeNodes(first, last) {
    // Remove last to first and all nodes in between
    let node  = last;
    let count = 0;

    while (node && node !== first) {
        const previous = node.previousSibling;
        node.remove();
        node = previous;
        ++count;
    }

    first.remove();
    ++count;

    return count;
}

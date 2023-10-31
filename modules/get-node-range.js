
const nodes = [];

export default function getNodeRange(first, last) {
    nodes.length = 0;
    let node = first;

    while (node !== last) {
        if (!node) {
            throw new Error('getNodes(first, last) last not found after first')
        }

        nodes.push(node);
        node = node.nextSibling;
    }

    nodes.push(last);
    return nodes;
}

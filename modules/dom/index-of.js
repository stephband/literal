
const A = Array.prototype;

export default function indexOf(node) {
    // Get the index of a DOM node
    return A.indexOf.apply(node.parentNode.childNodes, arguments);
}

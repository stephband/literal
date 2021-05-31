
import Renderer from './renderer.js';

/**
ContentRenderer()
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert 
that DOM after the text node.
**/

const assign = Object.assign;
const array  = [];

function removeNodes(firstNode, lastNode) {
    let node = lastNode;
    while (node !== firstNode) {
        lastNode = node.previousSibling;
        node.remove();
        node = lastNode;
    }
}

function setContent(renderer, node, nodes) {
    // TODO: WE MUST ALSO UNBIND ANY SUB-TEMPLATES THAST WERE INCLUDED! HOW?

    if (renderer.lastNode) {
        removeNodes(renderer.node, renderer.lastNode);
        renderer.lastNode = undefined;
    }

    var n = -1;
    var string = '';

    while (++n < nodes.length && typeof nodes[n] === 'string') {
        string += nodes[n];
    }

    // Change text in text node to initial string
    node.nodeValue = string;

    // Fast out if there are no more nodes
    if (n === nodes.length) {
        return 1;
    }

    // Get the rest of the things, consolidating strings
    array.length = 0;
    string = '';
    --n;
    
    while (++n < nodes.length) {
        if (typeof nodes[n] === 'string') {
            string += nodes[n];
        }
        else {
            string && array.push(string);
            array.push(nodes[n]);
            string = '';
        }
    }

    array.push(document.createTextNode(string));
    array.length && node.after.apply(node, array);
    
    // Keep a record of the last node for removal on next update
    renderer.lastNode  = array[array.length - 1];

    // Return the number of nodes appended to DOM
    return 1 + array.length;
}

export function ContentRenderer(fn, path, node) {
    Renderer.apply(this, arguments);
    this.update = (values) => setContent(this, node, values);
}

assign(ContentRenderer.prototype, Renderer.prototype);

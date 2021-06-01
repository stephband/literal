
import Renderer         from './renderer.js';
import { isTextNode }   from './dom.js';


const assign = Object.assign;
const array  = [];


/**
ContentRenderer()
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert 
that DOM after the text node.
**/

function remove(count, node) {
    // Todo: Express this more clearly
    node.stop && node.stop();
    count += (node.remove() || 1);
    return count;
}

function setContent(node, children, contents) {
    let count = 0;

    // Fast out for the common case where there is but one text node to render, 
    // for which we employ our registration node.
    if (!contents.length || (contents.length === 1 && typeof contents[0] === 'string')) {      
        count = children.reduce(remove, count);
        node.nodeValue = contents[0] || '';
        return ++count;
    }

    let c = -1, n = 0;
    let content, child;

    // Deal with first child if it is a string
    if (typeof contents[0] === 'string') {
        node.nodeValue = contents[0];
        c = 0;
    }
    else {
        node.nodeValue = ''; 
    }

    // Deal with rest of children
    while (content = contents[++c]) {
        // If content is a string look for the next text node
        if (typeof content === 'string') {
            // Throw away any non-text entries
            while (n < children.length && !isTextNode(children[n])) {
                count = children.splice(n, 1).reduce(remove, count);
            }

            // If child exists fill it with content
            if (children[n]) {
                children[n].nodeValue = content;
                ++count;
            }

            // Otherwise create a text node with content
            else {
                child = document.createTextNode(content);                
                // TODO: cant after ting tings
                children[n - 1].after(child);
                children.push(child);
                ++count;
            }

            ++n;
        }
        else {
            // Throw away any text nodes
            while (n < children.length && isTextNode(children[n])) {
                count = children.splice(n, 1).reduce(remove, count);
            }

            child = children[n];

            if (!child) {
                const text = document.createTextNode('');
                (children[n - 1] || node).after(content.fragment, text);
                children.push(content, text);
                ++count;
            }
            else if (child.content !== content.content || child.data !== content.data) {
                count = remove(count, children[n]);
                (children[n - 1] || node).after(content.fragment);
                children[n] = content;
                ++count;
            }

            ++n;
        }
    }

    count = children.splice(n).reduce(remove, count);

    // Return the number of contents appended to DOM
    return count;
}

export function ContentRenderer(fn, path, node) {
    Renderer.apply(this, arguments);
    // The children collection is a collection of text nodes and TemplateRenderers
    this.children = [];
    this.update   = (contents) => setContent(this.node, this.children, contents);
}

assign(ContentRenderer.prototype, Renderer.prototype);

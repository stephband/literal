
import overload from '../../fn/modules/overload.js';
import { setBooleanProperty, setAttribute } from './dom.js';

const assign  = Object.assign;
const nothing = [];

/** 
Renderer()
**/

export default function Renderer(fn, path, node, name, set) {
    this.node = node;
    this.path = path;
    this.fn   = fn;
    this.name = name;

    if (set) {
        this.set  = set;
        this.update = (value) => set(node, name, value);
    }
}

assign(Renderer.prototype, {
    render: function(observer, data) {
        return this
        .fn(observer, data)
        .then(this.update);
    }
});


/** 
AttributeRenderer()
Constructs an object responsible for rendering to a plain text attribute.
**/

export function AttributeRenderer(fn, path, node, name) {
    Renderer.apply(this, arguments);
    this.update = (value) => setAttribute(node, name, value);
}

assign(AttributeRenderer.prototype, Renderer.prototype);


/** 
BooleanRenderer()
Constructs an object responsible for rendering to a boolean attribute.
**/

export function BooleanRenderer(fn, path, node, name) {
    Renderer.apply(this, arguments);
    this.update = (value) => setBooleanProperty(node, name, value);

    // Remove the boolean until it is processed
    node.removeAttribute(name);
}

assign(BooleanRenderer.prototype, Renderer.prototype);


/** 
TokensRenderer()
Constructs an object responsible for rendering to a token list attribute such
as a class attribute.
**/

const getTokenList = overload((node, name) => name, {
    'class': (node) => node.classList
});

function setTokens(list, cached, tokens, count) {
    // Remove tokens from the cache that are found in new tokens.
    let n = cached.length;
    while (n--) {
        if (tokens.indexOf(cached[n]) !== -1) {
            cached.splice(n, 1);
        }
    }

    // Remove the remainder from the list
    if (cached.length) {
        list.remove.apply(list, cached);
        ++count;
    }

    // Then add the new tokens. The TokenList object ignores tokens it 
    // already contains.
    list.add.apply(list, tokens);
    return ++count;
}

export function TokensRenderer(fn, path, node, name) {
    Renderer.apply(this, arguments);

    // Empty the token list until it is rendered
    node.setAttribute(name, '');

    const list = getTokenList(node, name);
    let cached = nothing;
    this.update = (tokens) => {
        const count = setTokens(list, cached, tokens, 0);
        cached = tokens;
        // Count 1 for removing, 1 for adding
        return count;
    };
}

assign(TokensRenderer.prototype, Renderer.prototype);


/**
TextRenderer()
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert 
that DOM after the text node.
**/

const array = [];

function removeNodes(firstNode, lastNode) {
    let node = lastNode;
    while (node !== firstNode) {
        lastNode = node.previousSibling;
        node.remove();
        node = lastNode;
    }
}

function setText(renderer, node, nodes) {
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

export function TextRenderer(fn, path, node) {
    Renderer.apply(this, arguments);
    this.update = (values) => setText(this, node, values);
}

assign(TextRenderer.prototype, Renderer.prototype);

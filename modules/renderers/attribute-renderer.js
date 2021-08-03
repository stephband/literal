
import library  from '../library.js';
import compile  from '../compile.js';
import Renderer from './renderer.js';

const assign = Object.assign;


/** 
AttributeRenderer()
Constructs an object responsible for rendering to a plain text attribute.
**/

function setAttribute(node, name, value) {
    if (value === node.getAttribute(name)) { return 0; }
    // Mutate DOM
    node.setAttribute(name, value);
    // Return number of mutations
    return 1;
}

export default function AttributeRenderer(node, options) {
    Renderer.apply(this, arguments);
    this.literally = options.literally || compile(library, 'data, state, element', options.source, null, options, this.element);
    this.name      = options.name;
    this.update    = (value) => setAttribute(node, this.name, value);
}

assign(AttributeRenderer.prototype, Renderer.prototype);

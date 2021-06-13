
import library   from '../library.js';
import Renderer  from './renderer.js';
import compile   from '../compile.js';

const assign = Object.assign;


/** 
BooleanRenderer()
Constructs an object responsible for rendering to a boolean attribute.
**/

export function setBooleanProperty(node, name, value) {
    if (name in node) {
        if ((!!value) === node[name]) {
            return 0;
        }

        node[name] = value;
    }
    else if (value) {
        node.setAttribute(name, name);
    }
    else {
        node.removeAttribute(name);
    }

    // Return DOM mutation count
    return 1;
}

export default function BooleanRenderer(consts, source, node, path, name) {
    Renderer.apply(this, arguments);
    this.render = compile(library, consts, source, null, 'arguments[1]');
    this.update = (value) => setBooleanProperty(node, name, value);

    // Remove the boolean until it is processed
    node.removeAttribute(name);
}

assign(BooleanRenderer.prototype, Renderer.prototype);

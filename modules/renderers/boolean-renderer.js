
import library   from '../library.js';
import Renderer, { renderString } from './renderer.js';
import compile   from '../compile.js';
import analytics from './analytics.js';
import names     from './property-names.js';

const assign = Object.assign;
/** 
BooleanRenderer()
Constructs an object responsible for rendering to a boolean attribute.
**/

export function setBooleanProperty(node, name, value) {
    const prop = names[name] || name;

    if (prop in node) {
        if ((!!value) === node[prop]) {
            return 0;
        }

        node[prop] = !!value;
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

export default function BooleanRenderer(node, options) {
    Renderer.apply(this, arguments);
    
    this.name      = options.name;
    this.literally = options.literally || compile(library, 'data, element', options.source, null, options, this.element);

    // Remove the boolean until it is processed
    node.removeAttribute(this.name);

    // Analytics
    const id = '#' + options.template;
    ++analytics[id].boolean || (analytics[id].boolean = 1);
    ++analytics.Totals.boolean;
}

assign(BooleanRenderer.prototype, Renderer.prototype, {
    compose: function() {
        const value = renderString(arguments);
        return setBooleanProperty(this.node, this.name, value)
    }
});


import library       from '../library-dom.js';
import composeString from './compose-string.js';
import names         from './property-names.js';
import Renderer      from './renderer.js';

const assign = Object.assign;

/**
AttributeRenderer()
Constructs an object responsible for rendering to a plain text attribute.
**/

function setAttribute(node, name, value) {
    const prop = name in names ?
        names[name] :
        name;

    // Seek and set a matching property
    if (prop && prop in node) {
        if (node[prop] !== value) {
            node[prop] = value;
            return 1;
        }
    }

    // If that doesn't work set the attribute
    if (value === node.getAttribute(name)) {
        return 0;
    }

    node.setAttribute(name, value);
    return 1;
}

export default function AttributeRenderer(source, attribute, path, parameters, message) {
    const params = assign({}, parameters, { element: attribute.ownerElement });
    Renderer.call(this, source, library, params, message);

if (!attribute.ownerElement) {
    debugger;
}

    this.node = attribute.ownerElement;
    this.name = attribute.localName;
    this.path = path;
}

assign(AttributeRenderer.prototype, Renderer.prototype, {
    render: function() {
        const value = composeString(arguments);
        this.mutations = setAttribute(this.node, this.name, value);
        return this;
    }
});

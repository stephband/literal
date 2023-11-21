
import library       from '../scope-dom.js';
import composeString from './compose-string.js';
import names         from './property-names.js';
import Renderer      from './renderer.js';

const assign        = Object.assign;
const getDescriptor = Object.getOwnPropertyDescriptor;
const getPrototype  = Object.getPrototypeOf;

/**
AttributeRenderer()
Constructs an object responsible for rendering to a plain text attribute.
**/

function isWritableProperty(name, object) {
    const descriptor = getDescriptor(object, name);
    return descriptor ?
        // Accessor property or value property
        descriptor.set || descriptor.writable :
        // We know name in object at this point so property must be defined
        // somewhere, ergo we don't risk running out of prototypes. I think.
        isWritableProperty(name, getPrototype(object)) ;
}

function isWritable(name, element) {
    // Is property defined in object or in its prototype chain?
    return name in element ?
        // Then find out if it can be written to
        isWritableProperty(name, element) :
        // Avoid setting any properties on element not already defined
        false ;
}

function setAttribute(node, name, prop, writable, value) {
    // Seek and set a matching property
    if (writable) {
        if (node[prop] !== value) {
            node[prop] = value;
            return 1;
        }

        return 0;
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

    this.node = attribute.ownerElement;
    this.name = attribute.localName;
    this.path = path;
    this.prop = this.name in names ? names[this.name] : this.name ;
    this.writable = isWritable(this.name, this.node);
}

assign(AttributeRenderer.prototype, Renderer.prototype, {
    render: function() {
        const value = composeString(arguments);
        this.mutations = setAttribute(this.node, this.name, this.prop, this.writable, value);
        return this;
    }
});

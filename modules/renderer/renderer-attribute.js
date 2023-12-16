
import scope         from '../scope-dom.js';
import composeString from './compose-string.js';
import names         from './property-names.js';
import Renderer      from './renderer.js';

const assign        = Object.assign;
const getDescriptor = Object.getOwnPropertyDescriptor;
const getPrototype  = Object.getPrototypeOf;

/**
AttributeRenderer(path, name, source, element, message)
Constructs an object responsible for rendering to a plain text attribute.
**/

function isWritableProperty(name, object) {
    const descriptor = getDescriptor(object, name);
    return descriptor ?
        // Accessor property with setter or writable value property
        descriptor.set || descriptor.writable :
        // We know name in object at this point so property must be defined
        // somewhere, ergo we don't risk running out of prototypes when
        // recursing up the prototype chain. I think.
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

function setAttribute(node, name, property, writable, value) {
    // Seek and set a matching property
    if (writable) {
        if (node[property] !== value) {
            node[property] = value;
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

export default function AttributeRenderer(path, name, source, element, message) {
    Renderer.apply(this, arguments);
    this.property = name in names ?
        names[name] :
        name ;
    this.writable = isWritable(name, element);
}

assign(AttributeRenderer.prototype, Renderer.prototype, {
    render: function() {
        // TODO: This may be dangerous. Test with promises and arrays and the like
        this.value = this.singleExpression ?
            arguments[1] :
            composeString(arguments) ;
        this.mutations = setAttribute(this.element, this.name, this.property, this.writable, this.value);
        return this;
    }
});

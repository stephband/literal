
import composeString from './compose-string.js';
import names         from './property-names.js';
import Renderer      from './renderer.js';

const assign        = Object.assign;
const getDescriptor = Object.getOwnPropertyDescriptor;
const getPrototype  = Object.getPrototypeOf;

const stats = {
    attribute: 0,
    property:  0
};


/**
AttributeRenderer(path, name, source, message, options, element)
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
    stats.attribute = 0;
    stats.property  = 0;

    // Seek and set a matching property
    if (writable) {
        if (node[property] !== value) {
            node[property] = value;
            stats.property = 1;
        }
        return stats;
    }

    // If that doesn't work set the attribute
    if (value === node.getAttribute(name)) {
        return stats;
    }

    node.setAttribute(name, value);
    stats.attribute = 1;
    return stats;
}

export default class AttributeRenderer extends Renderer {
    static parameterNames = Renderer.parameterNames;

    constructor(fn, element, name, parameters) {
        super(fn, element, name, parameters);
        this.property = name in names ? names[name] : name ;
        this.writable = name in names ?
            // If name is listed as null or other falsy in property-names.js,
            // it is considered readonly. This applies to the `form` attribute.
            !!names[name] :
            // Otherwise check property descriptor
            name in element && isWritableProperty(name, element) ;

        // MOVED TO COMPILE STEP compile-attribute.js.
        // Avoid errant template literals making booleans default to true,
        // mangling classes and unnecessarily checking checkboxes.
        //element.removeAttribute(name);
    }

    render() {
        // TODO: This may be dangerous. Test with promises and arrays and the like
        this.value = this.singleExpression ?
            arguments[1] :
            composeString(arguments) ;

        const stats = setAttribute(this.element, this.name, this.property, this.writable, this.value);
        this.mutations = stats.attribute;

        return stats;
    }
}

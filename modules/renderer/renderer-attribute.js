
import composeString from './compose-string.js';
import names         from './property-names.js';
import Renderer, { stats } from './renderer.js';

const getDescriptor = Object.getOwnPropertyDescriptor;
const getPrototype  = Object.getPrototypeOf;


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

function setProperty(node, name, value) {
    // Seek and set a matching property
    if (node[name] === value) return 0;
    node[name] = value;
    return 1;
}

function setAttribute(node, name, value) {
    if (value === node.getAttribute(name)) return 0;
    node.setAttribute(name, value);
    return 1;
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

        if (this.writable) {
            stats.property += setProperty(this.element, this.property, this.value);
        }
        else {
            stats.attribute += setAttribute(this.element, this.name, this.value);
        }
    }
}

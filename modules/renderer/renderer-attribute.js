
//import composeString from './compose-string.js';
import names  from './property-names.js';
import Renderer, { stats } from './renderer.js';
import { printRenderError } from '../scope/print.js';
import toText from './to-text.js';


const getDescriptor = Object.getOwnPropertyDescriptor;
const getPrototype  = Object.getPrototypeOf;


/**
AttributeRenderer(signal, literal, parameters, element, name)
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
    if (window.DEBUG) ++stats.property;
}

function setAttribute(node, name, value) {
    if (value === node.getAttribute(name)) return 0;
    node.setAttribute(name, value);
    if (window.DEBUG) ++stats.attribute;
}

export function toAttributeString(values) {
    // Zip strings and values into a single string
    const strings = values[0];
    let n      = 0;
    let string = strings[n];
    while (strings[++n] !== undefined) {
        string += toText(values[n]);
        string += strings[n];
    }
}

export default class AttributeRenderer extends Renderer {
    static parameterNames = Renderer.parameterNames;

    constructor(signal, literal, parameters, element, name, debug) {
        super(signal, literal, parameters, element, name, debug);

        this.name     = name;
        this.property = name in names ? names[name] : name ;
        this.writable = name in names ?
            // If name is listed as null or other falsy in property-names.js,
            // it is considered readonly. This applies to the `form` attribute.
            !!names[name] :
            // Otherwise check property descriptor
            name in element && isWritableProperty(name, element) ;
    }

    evaluate() {
        if (window.DEBUG) {
            try {
                return super.evaluate();
            }
            catch(error) {
                // Error object, renderer, DATA
                const elem = printRenderError(this, error);
                console.log(this);
                this.element.before(elem);
                return;
            }
        }

        return super.evaluate();
    }

    render(strings) {
        // If arguments contains a single expression use its value
        const value = this.singleExpression ?
            arguments[1] :
            toAttributeString(arguments) ;

        return this.writable ?
            setProperty(this.element, this.property, value) :
            setAttribute(this.element, this.name, value) ;
    }
}

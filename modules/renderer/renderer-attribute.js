
import Signal         from 'fn/signal.js';
import names          from './property-names.js';
import Renderer, { stats } from './renderer.js';
import { printError } from '../print.js';
import toText         from './to-text.js';


const getDescriptor = Object.getOwnPropertyDescriptor;
const getPrototype  = Object.getPrototypeOf;


/**
AttributeRenderer(signal, literal, consts, element, name)
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
    return string;
}

export default class AttributeRenderer extends Renderer {
    static consts = Renderer.consts;

    constructor(signal, literal, consts, element, name, debug) {
        super(signal, literal, consts, element, name, debug);

        this.name = name;

        // TODO: property ought to be tested dynamically on custom elements
        // as they can be upgraded at any point
        const property = name in names ? names[name] : name;
        if (property
            && (property in element)
            && isWritableProperty(property, element)) {
            this.property = property;
        }

        // Only evaluate now if this is not a sub-class. Sub classes may yet
        // have more work to do and will take care of their own renders.
        if (this.constructor === AttributeRenderer) {
            Signal.evaluate(this, this.evaluate);
        }
    }

    evaluate() {
        if (window.DEBUG) {
            try {
                return super.evaluate();
            }
            catch(error) {
                // Error object, renderer, DATA
                const elem = printError(this, error);
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

console.log('RENDER ATTR', this.name, this.property, value, this.singleExpression, strings, arguments);

        return this.property ?
            setProperty(this.element, this.property, value) :
            setAttribute(this.element, this.name, value) ;
    }
}

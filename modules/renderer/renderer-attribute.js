
import isMutableProperty from 'fn/is-mutable-property.js';
import Signal            from 'fn/signal.js';
import names             from './property-names.js';
import Renderer          from './renderer.js';
import toText            from './to-text.js';
import { printError }    from '../print.js';


const assign        = Object.assign;
const getDescriptor = Object.getOwnPropertyDescriptor;
const getPrototype  = Object.getPrototypeOf;


/**
AttributeRenderer(signal, literal, consts, element, name)
Constructs an object responsible for rendering to a plain text attribute.
**/

function setProperty(node, name, value) {
    // Seek and set a matching property
    if (node[name] === value) return;
    node[name] = value;
}

function setAttribute(node, name, value) {
    const current = node.getAttribute(name);
    // Value has not changed
    if (value === current) return;
    // Value is null or undefined
    if (value === null || value === undefined) {
        if (current === null) return;
        node.removeAttribute(name);
    }
    else {
        node.setAttribute(name, value);
    }
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
    constructor(fn, parameters, element, name, compiled, isEvaluate) {
        super(fn, assign({}, parameters, { element }), compiled);

        // Detect un-upgraded (or indeed, upgraded) custom element
        this.isCustomElement = element.tagName.includes('-');
        this.element = element;
        this.name    = name;

        // TODO: property ought to be tested dynamically on custom elements
        // as they can be upgraded at any point
        const property = name in names ? names[name] : name;
        if (property
            && (property in element)
            && isMutableProperty(property, element)) {
            this.property = property;
        }

        // Evaluate now unless explicitly told not to by subclass
        if (isEvaluate !== false) Signal.evaluate(this, this.evaluate);
    }

    evaluate() {
        if (window.DEBUG) {
            try {
                return super.evaluate();
            }
            catch(error) {
                // Error object, renderer, DATA
                const elem = printError(this.compiled, error);
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

        const { element, name, property } = this;

        return this.isCustomElement ?
            // Does element have property of same name as attribute...
            name in element ?
                // and it's writable, set property
                isMutableProperty(name, element) ?
                    setProperty(element, name, value) :
                    // otherwise set the attribute
                    setAttribute(element, name, value) :
            typeof value === 'object' ?
                setProperty(element, name, value) :
                setAttribute(element, name, value) :
            // If element has a mapped property name, set it
            property ?
                setProperty(element, property, value) :
                // otherwise set attribute
                setAttribute(element, name, value) ;
    }
}

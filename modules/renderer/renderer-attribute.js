
import isMutableProperty from 'fn/is-mutable-property.js';
import Signal            from 'fn/signal.js';
import names             from './property-names.js';
import Renderer          from './renderer.js';
import toText            from './to-text.js';
import { printError }    from '../print.js';


const assign        = Object.assign;


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

function resolveProperty(element, name) {
    const property = name in names ? names[name] : name;
    return property && (property in element) && isMutableProperty(property, element) ?
        property :
        undefined ;
}

export default class AttributeRenderer extends Renderer {
    constructor(fn, parameters, element, name, compiled, isEvaluate) {
        super(fn, assign({}, parameters, { element }), compiled);

        this.element  = element;
        this.name     = name;
        // Use compile-time resolved property (zero prototype walk on built-in elements)
        this.property = compiled ?
            compiled.property :
            resolveProperty(element, name) ;

        // Only autonomous custom elements can upgrade later to add new properties
        const isCustom = compiled ?
            Boolean(compiled.upgradeable) && element.tagName.includes('-') :
            element.tagName.includes('-') ;

        // Has the custom element been upgraded already? ...
        if (isCustom && element.constructor !== HTMLElement) {
            this.property        = resolveProperty(element, name);
            this.isCustomElement = false;
        }
        // Nope
        else {
            this.isCustomElement = isCustom;
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

    renderSingle(value) {
        const { element, name } = this;

        // Custom element awaiting upgrade (or newly upgraded since last render)
        if (this.isCustomElement) {
            if (element.constructor !== HTMLElement) {
                // Upgraded: resolve property mutability once and switch to fast path
                this.property        = resolveProperty(element, name);
                this.isCustomElement = false;
            }
            else {
                // Un-upgraded: use inherited mutable property, else object as property / primitive as attribute
                return this.property ?
                    setProperty(element, this.property, value) :
                    typeof value === 'object' && value !== null ?
                        setProperty(element, name, value) :
                        setAttribute(element, name, value) ;
            }
        }

        // Fast path for built-in elements and upgraded custom elements
        return this.property ?
            setProperty(element, this.property, value) :
            setAttribute(element, name, value) ;
    }

    render() {
        return this.renderSingle(toAttributeString(arguments));
    }
}

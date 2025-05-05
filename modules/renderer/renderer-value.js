
import id                from 'fn/id.js';
import get               from 'fn/get.js';
import overload          from 'fn/overload.js';
import Signal            from 'fn/signal.js';
import trigger           from 'dom/trigger.js';
import config            from '../config.js';
import { stash }         from '../stash.js';
import AttributeRenderer, { toAttributeString } from './renderer-attribute.js';
import { stats }         from './renderer.js';
import toText            from './to-text.js';


const A = Array.prototype;

const enhancedTypes = {
    'select-one':      true,
    'select-multiple': true,
    'checkbox':        true,
    'radio':           true,
    // <option> does not have .type
    'undefined':       true
};


/** getValue(element)

Literal provides a mechanism for setting and getting values of any type on
select, checkbox and radio inputs. Where `input.value` always returns a string
(on uncustomised DOM elements, at least), `stash(element)` returns the value
set by a Literal template *before* it was coerced to a string. If no such value
exists it falls back to returning the string.

```
events('input', document.body)
.map((e) => getValue(e.target))
.each(console.log);
```
**/

function getElementValue(element) {
    return stash.has(element) ? stash.get(element) :
        'value' in element ? element.value :
        element.getAttribute('value') ;
}

export const getValue = overload(get('type'), {
    // If element is a <select> return value of selected <option>
    'select-one': (element) => (
        element.selectedIndex > -1 ?
            getElementValue(element.options[element.selectedIndex]) :
            undefined
    ),

    // If element is a <select multiple> return an array of values
    'select-multiple': (element) => A.filter
        .call(element.options, get('selected'))
        .map(getElementValue),

    // Otherwise return $value of enhanced element types
    'checkbox': getElementValue,
    'radio':    getElementValue,

    // Or number of numerical types
    'number':   (element) => Number(element.value),
    'range':    (element) => Number(element.value),

    // Or just the string value
    'default':  (element) => element.value
});


/**
setValue(element, value)
Sets value expando and value property on element.
**/

const types = {
    'number': 'number',
    'range':  'number'
};

function setElementValue(element, value) {
    // Don't render into focused nodes, it makes the cursor jump to the
    // end of the field, and we should cede control to the user
    if (document.activeElement === element) return;

    const isEnhanced = enhancedTypes[element.type];

    // If value is already stashed do nothing
    if (isEnhanced && stash.has(element) && stash.get(element) === value) return;

    // Refuse to set value that does not conform to input type
    const expectedType = types[element.type];
    if (expectedType && typeof value !== expectedType) return;

    // Where input is an enhanced type stash object
    if (isEnhanced) stash.set(element, value);

    // Convert to string with Literal's text rendering rules
    const string = toText(value);

    // Avoid updating DOM with the same value.
    if (string === element.value) return;

    // Bit of an edge case, but where we have a custom element that has not
    // been upgraded yet, but will have a value property defined on its
    // prototype when it does upgrade, setting value on the instance now will
    // mask the ultimate get/set definition on the prototype...
    if ('value' in element) {
        element.value = string;
        if (window.DEBUG) ++stats.property;
    }
    // ...so don't, if property is not in node. Set the attribute, it will be
    // picked up on upgrade.
    else {
        element.setAttribute('value', string);
        if (window.DEBUG) ++stats.attribute;
    }

    // Optional event hook
    if (config.updateEvent) {
        trigger(config.updateEvent, element);
    }

    // Return DOM mod count
    return;
}

export const setValue = overload(get('type'), {
    'select-one': (element, value) => {
        // Where value is a primitive set it directly
        if (typeof value === 'string' || typeof value === 'number') {
            return setElementValue(element, value);
        }

        // Otherwise look for a matching option and select that
        const option = A.find.call(element.options, (option) => value === getElementValue(option));
        if (option && !option.selected) {
            option.selected = true;
            if (window.DEBUG) ++stats.property;
        }
    },

//    'select-multiple': (element, value) => {},

    'default': setElementValue
});


/**
ValueRenderer(fn, element, unused, consts)
Constructs an object responsible for rendering from a value attribute to a
value property. Parameter `name` is redundant, but here for symmetry with other
renderers.
**/

const coercer = {
    //'date':      composeDate,
    //'select-multiple': composeArray,
    'number': Number,
    'range':  Number
};

export default class ValueRenderer extends AttributeRenderer {
    constructor(signal, literal, consts, element, name, debug) {
        super(signal, literal, consts, element, 'value', debug);

        // A synchronous evaluation while data signal value is undefined binds
        // this renderer to changes to signal. If signal has value this also
        // renders the renderer immediately.
        Signal.evaluate(this, this.evaluate);
    }

    render(strings, value) {
        return setValue(this.element,
            this.singleExpression ?
                coercer[this.element.type] ?
                    coercer[this.element.type](value) :
                value :
            toAttributeString(arguments)
        );
    }
}

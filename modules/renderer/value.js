
import get               from '../../../fn/modules/get.js';
import overload          from '../../../fn/modules/overload.js';
import trigger           from '../../../dom/modules/trigger.js';
import config            from '../config.js';
import toText            from './to-text.js';

const A      = Array.prototype;
const $value = Symbol('literal-value');


/** getValue(element)

Literal provides a mechanism for setting and getting values of any type
on elements with `value`. Where `element.value` always returns a string
(on uncustomised DOM elements, at least), getValue(element) returns the
value set by a Literal template *before* it was coerced to a string. If
no such value is set it falls back to returning the string.

```
events('input', document.body)
.map((e) => getValue(e.target))
.each(console.log);
```
**/

function getElementValue(element) {
    return $value in element ? element[$value] :
        value in element ? element.value :
        element.getAttribute('value') || undefined ;
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

    // Return numeric value ... TODO ?????
    'number': (element) => element[$value] || Number(element.value),
    'range':  (element) => element[$value] || Number(element.value),

    // Otherwise return $value of element
    'default': getElementValue
});


/**
setValue(element, value)
Sets value expando and value property on element.
**/

const types = {
    'number': 'number',
    'range':  'number'
};

export function setValue(element, value) {
    // Don't render into focused nodes, it makes the cursor jump to the
    // end of the field, and we should cede control to the user anyway
    if (document.activeElement === element) {
        return 0;
    }

    // If value is already set on $value expando do nothing
    if ($value in element && element[$value] === value) {
        return 0;
    }

    // Refuse to set value that does not conform to input type
    const type = typeof value;
    const expectedType = types[element.type];
    if (expectedType && type !== expectedType) {
        return 0;
    }

    // Set object value as a $value expando
    element[$value] = value;

    // Convert to string with Literal's text rendering rules
    const string = toText(value);

    // Avoid updating DOM with the same value.
    if (string === element.value) {
        return 0;
    }

    // Bit of an edge case, but where we have a custom element that has not
    // been upgraded yet, but will have a value property defined on its
    // prototype when it does upgrade, setting value on the instance now will
    // mask the ultimate get/set definition on the prototype.
    if (value in element) {
        element.value = string;
    }
    // So don't, if property is not in node. Set the attribute, it will be
    // picked up on upgrade.
    else {
        element.setAttribute('value', string);
    }

    // Optional event hook
    if (config.updateEvent) {
        trigger(config.updateEvent, element);
    }

    // Return DOM mod count
    return 1;
}


/**
removeValue(element)
Deletes value expando on element.
**/

export function removeValue(element) {
    delete element[$value];
}

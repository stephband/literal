
import get               from '../../../fn/modules/get.js';
import id                from '../../../fn/modules/id.js';
import overload          from '../../../fn/modules/overload.js';
import trigger           from '../../../dom/modules/trigger.js';
import config            from '../config.js';
import scope             from '../scope-dom.js';
import bindValue         from '../scope/bind-value.js';
import AttributeRenderer from './renderer-attribute.js';
import composeString     from './compose-string.js';
import composeNumber     from './compose-number.js';
import toText            from './to-text.js';

const A      = Array.prototype;
const assign = Object.assign;
const $value = Symbol('literal-value');


/**
ValueRenderer(source, node, path, name, parameters, message)
Constructs an object responsible for rendering from a value attribute to a
value property.

Parameter `name` is redundant, but here for symmetry with other cloneable
renderers.
**/

const types = {
    'number': 'number',
    'range':  'number'
};


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

const getValue = overload(get('type'), {
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

    // Otherwise return value of element
    'default': getElementValue
});


/**
setValue(element, value)
Sets value on element.
**/

function setValue(element, value) {
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

function removeValue(element) {
    delete element[$value];
}

const compose = overload((value, type) => type, {
    //'date':      composeDate,
    //'select-multiple': composeArray,
    'number':     composeNumber,
    'range':      composeNumber,
    'default':    composeString
});

export default function ValueRenderer(source, attribute, path, parameters, message) {
    AttributeRenderer.call(this, source, attribute, path, assign({
        // TODO: Experimental!
        bind: (path, to = id, from = id) => bindValue(this.node, this.data, path, to, from, setValue)
    }, parameters), message);
}

assign(ValueRenderer.prototype, AttributeRenderer.prototype, {
    render: function(strings) {
        if (this.singleExpression) {
            // Don't bother evaluating empty space in attributes
            this.value = arguments[1];
        }
        else {
            this.value = compose(arguments, this.node.type);
        }

        this.mutations = setValue(this.node, this.value);
        return this;
    },

    stop: function() {
        // Guard against memory leaks by cleaning up $value expando when
        // the renderer is done.
        removeValue(this.node);
        return AttributeRenderer.prototype.stop.apply(this, arguments);
    }
});

assign(scope, { getValue });

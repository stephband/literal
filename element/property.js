
import Signal               from 'fn/signal.js';
import arg                  from 'fn/arg.js';
import nothing              from 'fn/nothing.js';
import overload             from 'fn/overload.js';
import toCamelCase          from 'fn/to-camel-case.js';
import TokenList            from 'dom/element/token-list.js';
import updateTokenList      from 'dom/element/update-token-list.js';
import { getInternals }     from 'dom/element.js';
import requestData          from '../modules/request-data.js';

const define = Object.defineProperty;
const rpath  = /^\.*\/|^https?:\/\//;

const resolveAndAssign = function(signal, value) {
    if (rpath.test(value)) {
        requestData(value)
        .then((object) => signal.value = object)
        .catch((error) => console.error(error));
    }
    else {
        signal.value = JSON.parse(value);
    }
};

const symbols = {};

const types = {
    attribute: (name, symbol) => ({
        construct: function()      { define(this, symbol, { value: Signal.of('') }); },
        attribute: function(value) { this[symbol].value = value; }
    }),

    property: (name, symbol) => ({
        construct: function()      { define(this, symbol, { value: Signal.of() }); },
        get:       function()      { return this[symbol].value; },
        set:       function(value) { this[symbol].value = value; }
    }),

    src: (name, symbol) => ({
        construct: function()      { define(this, symbol, { value: Signal.of(null) }); },
        attribute: function(value) { this[name] = value; },
        get:       function()      { return this[symbol].value; },
        set:       function(value) {
            if (!rpath.test(value)) return;
            console.log('Literal request ' + name + ' "' + value + '"');
            requestData(value)
            .then((object) => this[symbol].value = object)
            .catch((error) => console.error(error));
        }
    }),

    // Todo: should accept JS module only
    module: (name, symbol) => ({
        construct: function()      { define(this, symbol, { value: Signal.of(null) }); },
        attribute: function(value) { this[name] = value; },
        get:       function()      { return this.getAttribute(name); },
        set:       function(value) {
            if (!rpath.test(value)) return;
            requestData(value)
            .then((object) => this[symbol].value = object)
            .catch((error) => console.error(error));
        }
    }),

    string: (name, symbol) => ({
        construct: function()      { define(this, symbol, { value: Signal.of('') }); },
        attribute: function(value) { this[name] = value; },
        get:       function()      { return this[symbol].value; },
        set:       function(value) { this[symbol].value = value; }
    }),

    boolean: (name, symbol) => ({
        construct: function()      { define(this, symbol, { value: Signal.of(false) }); },
        attribute: function(value) { this[name] = value; },
        get:       function()      { return this[symbol].value; },
        set:       function(value) { this[symbol].value = !!value; }
    }),

    number: (name, symbol) => ({
        construct: function()      { define(this, symbol, { value: Signal.of(0) }); },
        attribute: function(value) { this[name] = value; },
        get:       function()      { return this[symbol].value; },
        set:       function(value) {
            const number = Number(value);
            // Attempt to set invalid value... error?
            if (Number.isNaN(number)) throw new TypeError('Invalid value <' + this.tagName.toLowerCase() + '>.' + name + ' expects a number');
            this[symbol].value = number;
        }
    }),

    tokens: (name, symbol) => ({
        construct: function() { define(this, symbol, { value: new TokenList() }); },
        attribute: function(value) { this[name] = value || ''; },
        get:       function() { return this[symbol]; },
        set:       function(value) {
            const list = this[symbol];
            updateTokenList(list, (value + '').trim().split(/\s+/));
        }
    }),

    // Hmmm. Todo: should accept JSON url only
    json: (name, symbol) => ({
        construct: function() { define(this, symbol, { value: Signal.of(null) }); },
        attribute: function(value) { this[name] = value; },
        get:       function()      { return this.getAttribute(name); },
        set:       function(value) {
            if (!rpath.test(value)) return;
            requestData(value)
            .then((object) => this[symbol].value = object)
            .catch((error) => console.error(error));
        }
    }),

    data: (name, symbol) => ({
        get: function() { return getInternals(this).renderer.data; },
        set: function(data) { getInternals(this).renderer.push(data); }
    })
};

export default overload((name, descriptor) => typeof descriptor, {
    // Where descriptor is a function return a getter property that reads from
    // a compute signal of fn, where fn is nonetheless called with context set
    // to the object
    function: (name, fn) => {
        const camelcase = toCamelCase(name);
        const symbol = symbols[camelcase] || (symbols[camelcase] = Symbol(camelcase));
        return {
            construct: function() { define(this, symbol, { value: Signal.from(fn, this) }); },
            get:       function() { return this[symbol].value; }
        };
    },

    // Where descriptor is a descriptor object pass it straight back. Whoever
    // did this is expected to implement their own observers if needed.
    object: arg(1),

    // Where descriptor is a string return a descriptor object of that type
    string: (name, descriptor) => {
        const camelcase = toCamelCase(name);
        const symbol = symbols[camelcase] || (symbols[camelcase] = Symbol(camelcase));
        if (!types[descriptor]) throw new Error('element() property descriptor "' + descriptor + '" not supported');
        return types[descriptor](camelcase, symbol);
    }

    // Where descriptor is undefined assume it is an attribute
    /* WHY?
    undefined: (name) => ({
        attribute: function(value) { getInternals(this).data[name] = value; }
    })*/
});

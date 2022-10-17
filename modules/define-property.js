
import overload        from '../../fn/modules/overload.js';
import { getInternals as Internals } from '../../dom/modules/element.js';
import TokenList       from '../../dom/modules/element/token-list.js';
import updateTokenList from '../../dom/modules/element/update-token-list.js';

function updateTokens(element, name, string) {
    const list = element[name];
    updateTokenList(list, string.trim().split(/\s+/));
}

export default overload((name, type) => type, {
    attribute: (name) => ({
        attribute: function(value) { Internals(this)[name] = value; }
    }),

    property: (name) => ({
        get: function() { return Internals(this)[name].value; },
        set: function(value) { Internals(this)[name] = value; }
    }),

    string: (name) => ({
        attribute: function(value) { this[name] = value; },
        get: function() { return Internals(this)[name]; },
        set: function(value) { Internals(this)[name] = value; }
    }),

    boolean: (name) => ({
        attribute: function(value) { this[name] = value !== null; },
        get: function() { return !!Internals(this)[name] || false; },
        set: function(value) { Internals(this)[name] = !!value; }
    }),

    number: (name) => ({
        attribute: function(value) { this[name] = value; },
        get: function() { return Internals(this)[name] || 0; },
        set: function(value) { Internals(this)[name] = Number(value); }
    }),

    tokens: (name) => ({
        attribute: function(value) { this[name] = value || ''; },
        set: function(value) { updateTokens(this, name, value + ''); },
        get: function() {
            return Internals(this)[name] || (Internals(this)[name] = new TokenList());
        }
    }),

    default: (name, type) => {
        throw new SyntaxError('Cannot create custom property of type "' + type + '"');
    }
});

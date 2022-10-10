
import overload        from '../../fn/modules/overload.js';
import { State }       from '../../dom/modules/element.js';
import TokenList       from '../../dom/modules/element/token-list.js';
import updateTokenList from '../../dom/modules/element/update-token-list.js';

function updateTokens(element, name, string) {
    const list = element[name];
    updateTokenList(list, string.trim().split(/\s+/));
}

export default overload((name, type) => type, {
    attribute: (name) => ({
        attribute: function(value) { State(this)[name] = value; }
    }),

    property: (name) => ({
        get: function() { return State(this)[name].value; },
        set: function(value) { State(this)[name] = value; }
    }),

    string: (name) => ({
        attribute: function(value) { this[name] = value; },
        get: function() { return State(this)[name]; },
        set: function(value) { State(this)[name] = value; }
    }),

    boolean: (name) => ({
        attribute: function(value) { this[name] = value !== null; },
        get: function() { return !!State(this)[name] || false; },
        set: function(value) { State(this)[name] = !!value; }
    }),

    number: (name) => ({
        attribute: function(value) { this[name] = value; },
        get: function() { return State(this)[name] || 0; },
        set: function(value) { State(this)[name] = Number(value); }
    }),

    tokens: (name) => ({
        attribute: function(value) { this[name] = value || ''; },
        set: function(value) { updateTokens(this, name, value + ''); },
        get: function() {
            return State(this)[name] || (State(this)[name] = new TokenList());
        }
    }),

    default: (name, type) => {
        throw new SyntaxError('Cannot create custom property of type "' + type + '"');
    }
});

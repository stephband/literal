import { Observer as Data } from '../../fn/observer/observer.js';
import nothing              from '../../fn/modules/nothing.js';
import overload             from '../../fn/modules/overload.js';
import TokenList            from '../../dom/modules/element/token-list.js';
import updateTokenList      from '../../dom/modules/element/update-token-list.js';
import { getInternals as Internals } from '../../dom/modules/element.js';
import { addLoading, removeLoading } from './properties.js';
import requestData          from './request-data.js';

const rpath   = /^\.*\/|^https?:\/\//;

const resolveAndAssign = overload((name, element, value) => typeof value, {
    string: function(name, element, value) {
        const internals = Internals(element);
        const data      = internals.data;

        if (rpath.test(value)) {
            addLoading(element);

            requestData(value)
            .then((object) => data[name] = object)
            .catch((error) => console.error(error))
            .finally(() => removeLoading(element));
        }
        else {
            data[name] = JSON.parse(value);
        }

        return data;
    },

    default: function(name, element, value) {
        Internals(element)[name] = value;
    }
});

export default overload((name, type) => type, {
    attribute: (name) => ({
        attribute: function(value) { Internals(this).data[name] = value; }
    }),

    /* property: (name) => ({
        get: function() { return Internals(this).data[name].value; },
        set: function(value) { Internals(this).data[name] = value; }
    }),*/

    string: (name) => ({
        attribute: function(value) { this[name] = value; },
        get:       function() { return Internals(this).data[name]; },
        set:       function(value) { Internals(this).data[name] = value; },
        default:   ''
    }),

    boolean: (name) => ({
        attribute: function(value) { this[name] = value !== null; },
        get:       function() { return !!Internals(this).data[name] || false; },
        set:       function(value) { Internals(this).data[name] = !!value; },
        default:   false
    }),

    number: (name) => ({
        attribute: function(value) { this[name] = value; },
        get:       function() { return Internals(this).data[name] || 0; },
        set:       function(value) { Internals(this).data[name] = Number(value); },
        default:   0
    }),

    tokens: (name) => ({
        attribute: function(value) {
            this[name] = value || '';
        },

        get: function() {
            const internals = Internals(this);

            // Where list exists, return it
            if (internals[name]) {
                return internals[name];
            }

            // Create a simulated TokenList
            const list = internals[name] = new TokenList();

            // Replace tokens array with observer tokens array so that
            // changes are observed by Literal, and set it on data
            internals.data[name] = list.tokens = Data(list.tokens);

            return list;
        },

        set: function(value) {
            const list = this[name];
            updateTokenList(list, (value + '').trim().split(/\s+/));
        },

        default: nothing
    }),

    import: (name) => ({
        attribute: function(value) { this[name] = value; },
        get:       function() { return Internals(this).renderer.data[name]; },
        set:       function(value) { resolveAndAssign(name, this, value); },
        default:   null
    }),

    default: (name, type) => {
        throw new SyntaxError('Cannot create custom property of type "' + type + '"');
    }
});

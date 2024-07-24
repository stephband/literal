
import arg                  from '../../fn/modules/arg.js';
import nothing              from '../../fn/modules/nothing.js';
import overload             from '../../fn/modules/overload.js';
import Data                 from '../../fn/modules/data.js';
import TokenList            from '../../dom/modules/element/token-list.js';
import updateTokenList      from '../../dom/modules/element/update-token-list.js';
import { getInternals }     from '../../dom/modules/element.js';
import requestData          from './request-data.js';

const rpath   = /^\.*\/|^https?:\/\//;

const resolveAndAssign = overload((name, element, value) => typeof value, {
    string: function(name, element, value) {
        const internals = getInternals(element);

        if (rpath.test(value)) {
            /*addLoading(element);*/

            requestData(value)
            .then((object) => internals.data[name] = object)
            .catch((error) => console.error(error));
        }
        else {
            internals.data[name] = JSON.parse(value);
        }

        return internals.data;
    },

    default: function(name, element, value) {
        getInternals(element)[name] = value;
    }
});

export default overload((name, descriptor) => typeof descriptor, {
    // Where descriptor is a string return a descriptor object of that type
    string: overload((name, type) => type, {
        attribute: (name) => ({
            attribute: function(value) { getInternals(this).data[name] = value; }
        }),

        /* property: (name) => ({
            get: function() { return getInternals(this).data[name].value; },
            set: function(value) { getInternals(this).data[name] = value; }
        }),*/

        string: (name) => ({
            attribute: function(value) { this[name] = value; },
            get:       function() { return getInternals(this).data[name]; },
            set:       function(value) { getInternals(this).data[name] = value; },
            default:   ''
        }),

        boolean: (name) => ({
            attribute: function(value) { this[name] = value !== null; },
            get:       function() { return !!getInternals(this).data[name] || false; },
            set:       function(value) { getInternals(this).data[name] = !!value; },
            default:   false
        }),

        number: (name) => ({
            attribute: function(value) { this[name] = value; },
            get:       function() { return getInternals(this).data[name] || 0; },
            set:       function(value) { getInternals(this).data[name] = Number(value); },
            default:   0
        }),

        tokens: (name) => ({
            attribute: function(value) {
                this[name] = value || '';
            },

            get: function() {
                const internals = getInternals(this);

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

        src: (name) => ({
            attribute: function(value) { this[name] = value; },
            get:       function() { return getInternals(this).renderer.data[name]; },
            set:       function(value) { resolveAndAssign(name, this, value); },
            default:   null
        }),

        // Todo: should accept JS module only
        module: (name) => ({
            attribute: function(value) { this[name] = value; },
            get:       function() { return getInternals(this).renderer.data[name]; },
            set:       function(value) { resolveAndAssign(name, this, value); },
            default:   null
        }),

        // Todo: should accept JSON url only
        json: (name) => ({
            attribute: function(value) { this[name] = value; },
            get:       function() { return getInternals(this).renderer.data[name]; },
            set:       function(value) { resolveAndAssign(name, this, value); },
            default:   null
        }),

        default: (name, type) => {
            if (window.DEBUG && (type === 'url' || type === 'import')) {
                throw new SyntaxError('Literal type deprecated in attribute definition "' + name + ':' + type + '", should be "' + name + ':src", "' + name + ':module" or "' + name + ':json"');
            }

            throw new SyntaxError('Literal type not supported in attribute definition "' + name + ':' + type + '"');
        }
    }),

    // Where descriptor is a descriptor object pass it straight back
    object: arg(1),

    // Where descriptor is undefined assume it is an attribute
    undefined: (name) => ({
        attribute: function(value) { getInternals(this).data[name] = value; }
    })
});


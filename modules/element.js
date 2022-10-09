
import element, { State } from '../../dom/modules/element.js';
import getTemplate        from './get-template.js';
//import requestTemplate    from '../request-template.js';
import TemplateRenderer   from './renderer-template.js';

const assign = Object.assign;

export default function Element(definition, lifecycle, properties) {
    const construct = lifecycle.contruct;
    const connect   = lifecycle.connect;
    const load      = lifecycle.load;

    return element(definition, assign(lifecycle, {
        construct: function(shadow) {
            //const state = State(this);
            if (/^#/.test(lifecycle.template)) {
                const template = getTemplate(lifecycle.template);
                const renderer = new TemplateRenderer(template, this);
                const state    = State(this);

                shadow.append(renderer.content);
                construct && construct.call(this, state);

                return;
            }

            // Flag loading until we connect, at which point we add the
            // loading attribute that may be used to indicate loading. Why
            // wait? Because we are not in the DOM yet, and if we want a
            // loading icon to transition in the transition must begin after
            // we are already in the DOM.
//            this.loading = true;
//            requestTemplate(value).then((template) => {
//                privates.templates.push(template);
//            });
        },

        connect: connect && function() {
            const state = State(this);
            connect.call(this, state);
            renderer.push(state);
        },

        load: load && function() {
            const state = State(this);
            load.call(this, state);
            renderer.push(state);
        }
    }),

    assign(properties, {
        data: {
            attribute: function(value) {
                this.data = value;
            },

            set: function() {

            },

            get: function() {

            }
        },

        loading: {
            /**
            loading=""
            Read-only (pseudo-read-only) boolean attribute indicating status of
            `src` and `data` requests.
            **/

            /**
            .loading
            Read-only boolean indicating status of `src` and `data` requests.
            **/

            get: function() {
                const state = State(this);
                return state.loading;
            }
        }
    }));
}



import overload           from '../../fn/modules/overload.js';
import Stream             from '../../fn/modules/stream.js';
import element, { State } from '../../dom/modules/element.js';
import getTemplate        from './get-template.js';
//import requestTemplate    from '../request-template.js';
import requestData        from './request-data.js';
import TemplateRenderer   from './renderer-template.js';

const assign  = Object.assign;
const entries = Object.entries;
const rpath   = /^\/|\.|^https?:\/\//;

const onerror = window.DEBUG ?
    (e, element) => {
        //removeLoading(element);
        element.replaceWith(print(e));
        throw e;
    } :
    (e, element) => {
        //removeLoading(element);
        throw e;
    } ;

const resolveAndPushData = overload((renderer, value) => typeof value, {
    string: function(renderer, value) {
        if (rpath.test(value)) {
            requestData(value)
            .then((object) => renderer.push(object))
            .catch((error) => onerror(error, this));
        }
        else {
            renderer.push(JSON.parse(value));
        }

        return renderer;
    },

    default: function(renderer, value) {
        renderer.push(value);
        return renderer;
    }
});

function assignProperties(state, [name, definition]) {
    // Todo: do we need to set up streams here? Really?
    return state;
}

function connect() {
    const state = State(this);

    // DOM nonsense. If we are loading at connect add the loading attribute
    // after a couple of frames to allowing time for styled transitions to
    // initialise.
    (state.loading && (state.frame = requestAnimationFrame(() =>
        (state.loading && (state.frame = requestAnimationFrame(() =>
            (state.loading && this.setAttribute('loading', ''))
        )))
    )));
}

function load() {
    const state = State(this);

    if (state.loading) {
        if (state.frame) {
            cancelAnimationFrame(state.frame);
            state.frame = null;
        }
        else {
            this.removeAttribute('loading');
        }

        state.loading = false;
    }
}

export default function Element(tag, src, properties) {
    return element(tag, {
        construct: function(shadow) {
            const state = State(this);
            entries(properties).reduce(assignProperties, state);

            if (typeof src === 'string' && !/^#/.test(src)) {
                // Flag loading until we connect, at which point we add the
                            // loading attribute that may be used to indicate loading. Why
                            // wait? Because we are not in the DOM yet, and if we want a
                            // loading icon to transition in the transition must begin after
                            // we are already in the DOM.
                //            this.loading = true;
                //            requestTemplate(value).then((template) => {
                //                privates.templates.push(template);
                //            });
            }

            const template = typeof src === 'string' ?
                getTemplate(src) :
                src;

            const renderer = new TemplateRenderer(template, {
                element: this,
                state: state
            });

            state.data = Stream.of();
            state.data.reduce(resolveAndPushData, renderer);
            state.loading = true;

            shadow.append(renderer.content);
        },

        connect: connect,

        load: load
    },

    assign(properties, {
        data: {
            attribute: function(value) {
                this.data = value;
            },

            get: function() {
                const state = State(this);
                return state.renderer ?
                    state.renderer.data :
                    null ;
            },

            set: function(value) {
                const state = State(this);
                state.data.push(value);
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
                return State(this).loading;
            }
        }
    }));
}

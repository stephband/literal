

import overload           from '../../fn/modules/overload.js';
import Stream             from '../../fn/modules/stream.js';
import element, { getInternals as Internals } from '../../dom/modules/element.js';
import lifecycle          from './lifecycle.js';
import globalProperties   from './properties.js';
import getTemplate        from './get-template.js';
//import requestTemplate    from '../request-template.js';
import requestData        from './request-data.js';
import TemplateRenderer   from './renderer-template.js';

const assign  = Object.assign;
const entries = Object.entries;
const rpath   = /^\.*\/|^https?:\/\//;

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

function assignProperties(internal, [name, definition]) {
    // Todo: do we need to set up streams here? Really?
    return internal;
}

function load() {
    const internal = Internals(this);

    if (internal.loading) {
        if (internal.frame) {
            cancelAnimationFrame(internal.frame);
            internal.frame = null;
        }
        else {
            this.removeAttribute('loading');
        }

        internal.loading = false;
    }
}

export default function Element(tag, src, props) {
    const properties = assign({}, props, globalProperties);

    return element(tag, assign({}, lifecycle, {
        construct: function(shadow) {
            const internal = Internals(this);
            entries(props).reduce(assignProperties, internal);

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
                host:    this,
                shadow:  shadow,
                prop:    internal
            });

            internal.datas = Stream.of();
            internal.datas.reduce(resolveAndPushData, renderer);
            internal.loading = true;

            // Hmmm
            renderer.push(internal);

            shadow.append(renderer.content);
        },

        load: load
    }),

    properties,

    null,

    'defined by element-template');
}

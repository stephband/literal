
import { Observer as Data } from '../../fn/observer/observer.js';
import element, { getInternals as Internals } from '../../dom/modules/element.js';
import lifecycle            from './lifecycle.js';
import globalProperties, { addLoading, removeLoading, setLoading } from './properties.js';
import getTemplate          from './get-template.js';
import TemplateRenderer     from './renderer-template.js';

const assign  = Object.assign;

/**
element
The element enclosing the current template tag.
**/

/**
host
The custom element.
**/

/**
shadow
The custom element's shadow root.
**/

export default function defineElement(tag, src, props, log = '') {
    const properties = assign({}, props, globalProperties);

    return element(tag, assign({}, lifecycle, {
        construct: function(shadow) {
            const internals = Internals(this);

            if (typeof src === 'string' && !/^#/.test(src)) {
                // Flag loading until we connect, at which point we add the
                // loading attribute that may be used to indicate loading. Why
                // wait? Because we are not in the DOM yet, and if we want a
                // loading icon to transition in the transition must begin after
                // we are already in the DOM.
                // this.loading = true;
                // requestTemplate(value).then((template) => {
                //     privates.templates.push(template);
                // });
            }

            const template = typeof src === 'string' ?
                getTemplate(src) :
                src;

            const renderer = internals.renderer = new TemplateRenderer(template, {
                element:  this,
                host:     this,
                shadow:   shadow
            });

            // Initialise data with plain object
            internals.data = {};

            // Put raw template content into the host, so templated stylesheets
            // start loading (or do they?)
            shadow.append(renderer.content);
            addLoading(this);
        },

        connect: function() {
            const internals = Internals(this);
            const { renderer, data } = internals;

            // Give default value to properties not initialised via attributes
            let name;
            for (name in props) {
                if (!(name in data)) {
                    data[name] = props[name].default;
                }
            }

            // Set loading attribute
            if (internals.loading) {
                setLoading(this);
                data.loading = true;
            }

            // Set internal data to its observer proxy so that changes to host
            // attributes, which mutate data, now trigger template updates
            internals.data = Data(data);

            // We must render synchronously here else rendered 'slotchange'
            // listeners miss the first slotchange
            renderer.push(data);
        },

        load: function() {
            const internals = Internals(this);
            removeLoading(this);
            internals.data.loading = false;
        }
    }),

    properties, null, log);
}

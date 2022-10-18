
import { Observer as Data } from '../../fn/observer/observer.js';
import element, { getInternals as Internals } from '../../dom/modules/element.js';
import lifecycle            from './lifecycle.js';
import globalProperties, { addLoading, removeLoading, setLoadingAsync } from './properties.js';
import getTemplate          from './get-template.js';
import TemplateRenderer     from './renderer-template.js';

const assign  = Object.assign;

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

            internals.data = Data({});
            shadow.append(renderer.content);
            addLoading(this);
        },

        connect: function() {
            const { renderer, data } = Internals(this);
            renderer.push(data);
            setLoadingAsync(this);
        },

        load: function() {
            removeLoading(this);
        }
    }),

    properties, null, log);
}

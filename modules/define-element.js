
import cache                from '../../fn/modules/cache.js';
import { Observer as Data } from '../../fn/observer/observer.js';
import create               from '../../dom/modules/create.js';
import element, { getInternals as Internals } from '../../dom/modules/element.js';
import globalProperties, { setLoading } from './properties.js';
import defineProperty       from './define-property.js';
import getTemplate          from './get-template.js';
import TemplateRenderer     from './renderer-template.js';

const assign  = Object.assign;
const entries = Object.entries;

const baseStyle = `
    :host([loading]),
    :host([loading]) > * {
        transition: none !important;
    }
`;

/**
body
An alias of `document.body`.
**/

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

function assignProperty(properties, entry) {
    // Turn descriptor types into descriptor objects where necessary
    properties[entry[0]] = defineProperty(entry[0], entry[1]);
    return properties;
}

const requestStylesheet = cache(function requestStylesheet(url) {
    return new Promise((resolve, reject) => {
        const link = create('link', { rel: 'preload', as: 'style', href: url });
        link.onload = () => resolve(new URL(url, location));
        link.onerror = reject;

        // Links only load if they are placed in the document
        document.head.append(link);
    });
});

export default function defineElement(tag, src, lifecycle = {}, props, parameters = {}, stylesheets = []) {
    // Assemble properties
    const properties = props ?
        assign(entries(props).reduce(assignProperty, {}), globalProperties) :
        globalProperties ;

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
        console.error('TODO: Support external templates');
        return;
    }

    const template = typeof src === 'string' ?
        getTemplate(src) :
        src;

    // List of load requests that must complete before element is declared
    const requests = [template, parameters];

    // Populate requests with stylesheets passed in
    stylesheets
        .forEach((url) => requests.push(requestStylesheet(url)));

    // Extend requests with stylesheets found inside the template
    template.content
        .querySelectorAll('link[rel="stylesheet"]')
        .forEach((link) => requests.push(requestStylesheet(link.href)));

    return Promise
    .all(requests)
    .then(([template, parameters, ...stylesheets]) => element(tag, {
        construct: function(shadow) {
            const style     = create('style', baseStyle);
            const internals = Internals(this);
            const renderer  = internals.renderer = new TemplateRenderer(template, assign({}, parameters, {
                body:     document.body,
                element:  this,
                host:     this,
                root:     document.documentElement,
                shadow:   shadow
            }));

            // Initialise data with plain object
            internals.data = {};

            // Put raw template content into the host, so templated stylesheets
            // start loading (or do they?)
            shadow.append(style, renderer.content);
            //addLoading(this);

            lifecycle.construct && lifecycle.construct.call(this, shadow, internals);
        },

        connect: function(shadow) {
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

            lifecycle.connect && lifecycle.connect.call(this, shadow, internals);
        }
    }, properties, null, window.DEBUG ?
        ('\n  ' + stylesheets.map((url) => url.pathname).join('\n  ')) :
        ''
    ))
    .catch((e) => console.error(e));
}

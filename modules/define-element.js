
import cache                from '../../fn/modules/cache.js';
import { Observer as Data } from '../../fn/observer/observer.js';
import create               from '../../dom/modules/create.js';
import element, { getInternals } from '../../dom/modules/element.js';
import toPrefetchPromise    from '../../dom/modules/element/to-prefetch-promise.js';
import defineProperty       from './define-property.js';
import getTemplate          from './get-template.js';
import TemplateRenderer     from './renderer-template.js';

const assign  = Object.assign;
const entries = Object.entries;
const keys    = Object.keys;


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
Where this literal template renders the shadow DOM of a custom element, `host`
refers to the custom element.
**/

/**
shadow
Where this literal template renders the shadow DOM of a custom element, `shadow`
refers to the custom element's shadow root.
**/

function assignProperty(properties, entry) {
    // Turn descriptor types into descriptor objects where necessary
    properties[entry[0]] = defineProperty(entry[0], entry[1]);
    return properties;
}

function parseData(value) {
        // Object or array
    return robject.test(value) ? JSON.parse(value) :
        // Number
        !Number.isNaN(Number(value)) ? Number(value) :
        // Boolean
        value === 'true' ? true :
        value === 'false' ? false :
        // String
        value ;
}

function getDataFromDataset(dataset, data) {
    const keys   = Object.keys(dataset);
    const values = Object.values(dataset);

    values
    .map(parseData)
    .reduce((data, value, i) => (data[keys[i]] = value, data), {});
}

export default function defineElement(tag, src, lifecycle = {}, props, scope = {}) {
    // Assemble properties
    const properties = props ?
        entries(props).reduce(assignProperty, {}) :
        {} ;

    if (window.DEBUG && typeof src === 'string' && !/^#/.test(src)) {
        console.error('TODO: Support external templates');
        // requestTemplate(value).then((template) => {
        //     privates.templates.push(template);
        // });
        return;
    }

    const template = typeof src === 'string' ?
        getTemplate(src) :
        src;

    return element(tag, {
        construct: function(shadow) {
            const internals = getInternals(this);
            const renderer  = internals.renderer = new TemplateRenderer(template, assign({}, scope, {
                body:     document.body,
                element:  this,
                host:     this,
                root:     document.documentElement,
                shadow:   shadow
            }));

            // Initialise data with plain object
            const data = internals.data = {};

            // Put raw template content into the host, even though it has not
            // yet been rendered so that stylesheet links start loading (or do
            // they?)
            shadow.append(renderer.content);
            lifecycle.construct && lifecycle.construct.call(this, shadow, Data(data), internals);
        },

        connect: function(shadow) {
            const internals = getInternals(this);
            const { renderer, data } = internals;

            // Give default value to properties not initialised via attributes
            let name;
            for (name in props) {
                if (!(name in data)) {
                    data[name] = properties[name].default;
                }
            }

            // Get data found in dataset
            getDataFromDataset(this.dataset, data);

            // Set internal data to its observer proxy so that changes to host
            // attributes, which mutate data, now trigger template updates
            internals.data = Data(data);

            // Connect callback called pre-render
            lifecycle.connect && lifecycle.connect.call(this, shadow, Data(data), internals);

            // We must render synchronously here else rendered 'slotchange'
            // listeners miss the first slotchange
            renderer.push(data);
        }
    }, properties, null, window.DEBUG ?
        (keys(scope).length ? '\n  Imports ' + keys(scope).join(', ') : '') :
        ''
    );
}

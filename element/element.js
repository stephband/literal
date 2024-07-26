
import cache                     from '../../fn/modules/cache.js';
import Data                      from '../../fn/modules/data.js';
import create                    from '../../dom/modules/create.js';
import element, { getInternals } from '../../dom/modules/element.js';
import toPrefetchPromise         from '../../dom/modules/element/to-prefetch-promise.js';
import getById                   from '../modules/dom/get-by-id.js';
import Literal                   from '../modules/template.js';
import defineProperty            from './property.js';

const assign  = Object.assign;
const entries = Object.entries;
const keys    = Object.keys;



/**
element(tag, lifecycle, properties, parameters)

```js
element(tag, {
    // If a backtick string is used to write multi-line html, literal
    // expressions must be escaped

    templates: {
        'id': '<p>included</p>'
    },

    shadow: `<p>Property <code>switch</code> $\{ host.switch }</p>
        <p>Property <code>count</code> $\{ host.count }</p>
        <p>Property <code>string</code> $\{ host.string }</p>
        <p>Property <code>controls</code> $\{ host.controls }</p>`,

    construct: function(host, shadow, data) {},
    connect:   function(host, shadow, data) {}
}, {
    switch:   'boolean',
    count:    'number',
    text:     'string',
    controls: 'tokens',
    data:     'object'
});
```
**/





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
    try {
        return JSON.parse(value);
    }
    catch(e) {
        return value;
    }
}

function getDataFromDataset(dataset, data) {
    const keys   = Object.keys(dataset);
    const values = Object.values(dataset);

    return values
    .map(parseData)
    .reduce((data, value, i) => (data[keys[i]] = value, data), data);
}

export default function LiteralElement(tag, lifecycle = {}, properties = {}, parameters = {}) {
    if (window.DEBUG && typeof src === 'string' && !/^#/.test(src)) {
        console.error('TODO: Support external templates?');
        // requestTemplate(value).then((template) => {
        //     privates.templates.push(template);
        // });
        return;
    }

    const name = '<' + tag.replace(/^</, '').replace(/>$/, '') + '>';

    // Compile templates
    const template  = create('template', { id: name, html: lifecycle.shadow });
    const templates = Object
        .entries(lifecycle.templates)
        .map(([id, html]) => create('template', { id, html }));

    // Create templates. This is a crude way to do it, and we should probably
    // isolate templates in the shadow from those outside with a separate
    // template cache (based around shadow.getElementById()?)... but... it'll
    // do for now
    if (window.DEBUG) document.head.appendChild(create('comment', ' Templates for ' + name));
    document.head.append.apply(document.head, templates);

    const life = {
        // DEBUG stylesheet for in-DOM prints of errors and logs
        shadow: window.DEBUG ? '<link rel="stylesheet" href="../module.css">' : '',

        construct: function(shadow, internals) {
            // Render data
            internals.object = {};

            // template, parent, parameters, data, options
            const renderer = new Literal(template, this, assign({ host: this, shadow }, parameters), undefined);
            shadow.appendChild(renderer.content);

            // Call lifecycle.construct()
            internals.renderer = renderer;
            if (lifecycle.construct) lifecycle.construct.call(this, shadow, internals, internals.object);
        },

        connect: function(shadow, internals) {
            const { renderer } = internals;

            if (!internals.initialised) {
                internals.initialised = true;

                // Get data found in dataset
                getDataFromDataset(this.dataset, internals.object);

                // Set internal data to object's observer proxy
                internals.data = Data.of(internals.object);
            }

            // We must render synchronously here else rendered 'slotchange'
            // listeners miss the first slotchange... this IS synchronous, right?
            internals.renderer.push(internals.data);

            // Connect callback called post-render
            if (lifecycle.connect) lifecycle.connect.call(this, shadow, internals, internals.data);
        },

        disconnect: function(shadow, internals) {
            const { renderer } = internals;

            // Make literal renderer go dormant
            internals.renderer.push(null);

            // Disconnect callback post render
            if (lifecycle.disconnect) lifecycle.disconnect.call(this, shadow, internals, internals.data);
        },

        enable:  lifecycle.enable  && function enable(shadow, internals)  { lifecycle.enable.call(this, shadow, internals, internals.data); },
        disable: lifecycle.disable && function disable(shadow, internals) { lifecycle.disable.call(this, shadow, internals, internals.data); },
        reset:   lifecycle.reset   && function reset(shadow, internals)   { lifecycle.reset.call(this, shadow, internals, internals.data); },
        restore: lifecycle.restore && function restore(shadow, internals) { lifecycle.restore.call(this, shadow, internals, internals.data); }
    };

    // Assemble properties
    const props = properties ?
        entries(properties).reduce(assignProperty, {}) :
        {} ;

    const message = window.DEBUG ?
        'literal element stephen.band/literal/element/'
        + (keys(parameters).length ? '\n  Imports ' + keys(scope).join(', ') : '') :
        '' ;

    // tag, lifecycle, properties, stylesheet, message
    return element(tag, life, props, null, message);
}

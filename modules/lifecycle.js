

import { getInternals as Internals } from '../../dom/modules/element.js';

import Stream           from '../../fn/modules/stream.js';
import print            from './library/print.js';
import requestData      from './request-data.js';
import TemplateRenderer from './renderer-template.js';

const rpath = /^\/|\.|^https?:\/\//;

/* Lifecycle */

function parseData(value) {
    try { return JSON.parse(value);  }
    catch(e) { return value; }
}

function resolveData(value) {
    return rpath.test(value) ?
        requestData(value) :
        parseData(value) ;
}

function addLoading(element) {
    const internal = Internals(element);

    if (!internal.loading) {
        internal.loading = true;
        //element.setAttribute('loading', '');
    }
}

function removeLoading(element) {
    const internal = Internals(element);

    if (internal.loading) {
        internal.loading = false;

        if (internal.frame) {
            cancelAnimationFrame(internal.frame);
            internal.frame = null;
        }
        else {
            element.removeAttribute('loading');
        }
    }
}

const onerror = window.DEBUG ?
    (e, element) => {
        removeLoading(element);
        element.replaceWith(print(e));
        throw e;
    } :
    (e, element) => {
        removeLoading(element);
        throw e;
    } ;

export default {
    construct: function() {
        const privates   = Internals(this);
        const datas      = privates.datas      = Stream.of();
        const dataoutput = privates.dataoutput = Stream.of();
        const templates  = privates.templates  = Stream.of();

        let marker = this;

        datas.each((value) => {
            if (typeof value === 'string') {
                if (rpath.test(value)) {
                    // Wait a tick before requesting data. On initial page load
                    // we have not yet had time to populate rewrite URLs because
                    // custom element setup runs synchronously. Give us a tick
                    // so we can do that.
                    Promise
                    .resolve(value)
                    .then(requestData)
                    .then((data) => dataoutput.push(data))
                    .catch((e) => onerror(e, marker, privates));

                    addLoading(this);
                }
                else {
                    dataoutput.push(JSON.parse(value));
                }
            }
            else {
                dataoutput.push(value);
            }
        });

        Stream
        .combine({
            //load,
            data:     dataoutput,
            template: templates
        })
        .each((state) => {
            const { template, data } = state;
            const renderer = privates.renderer = new TemplateRenderer(template, { element: marker.parentElement });

            renderer.push(data);
            marker.replaceWith(renderer.content);
            removeLoading(this);
        });

        // Resolve data from dataset attributes
        const keys = Object.keys(this.dataset);
        if (keys.length) {
            const values = Object.values(this.dataset);

            Promise
            .all(values.map(resolveData))
            .then((values) =>
                dataoutput.push(values.reduce((data, value, i) => {
                    data[keys[i]] = value;
                    return data;
                }, {}))
            );
        }
    },

    connect: function(shadow) {
        const internal = Internals(this);

        // DOM nonsense. If we are loading at connect add the loading attribute
        // after a couple of frames to allowing time for styled transitions to
        // initialise.
        (internal.loading && (internal.frame = requestAnimationFrame(() =>
            (internal.loading && (internal.frame = requestAnimationFrame(() =>
                (internal.loading && this.setAttribute('loading', ''))
            )))
        )));
    },

    load: function(shadow) {
        const internal = Internals(this);
        internal.loading = false;
        this.removeAttribute('loading');
    }
};

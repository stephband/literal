
import Privates         from '../../fn/modules/privates.js';
import Stream           from '../../fn/modules/stream.js';
import print            from './library/print.js';
import requestData      from './request-data.js';
import TemplateRenderer from './renderer-template.js';

const rpath = /^\/|\.|^https?:\/\//;

/* Lifecycle */

/**
'slide-active'
Emitted by a slide when it is brought into scroll-snap alignment.
**/

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
    const privates = Privates(element);

    if (!privates.loading) {
        privates.loading = true;
        //element.setAttribute('loading', '');
    }
}

function removeLoading(element) {
    const privates = Privates(element);

    if (privates.loading) {
        privates.loading = false;

        if (privates.frame) {
            cancelAnimationFrame(privates.frame);
            privates.frame = null;
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
        const privates   = Privates(this);
        const datas      = privates.datas      = Stream.of();
        const dataoutput = privates.dataoutput = Stream.of();
        const templates  = privates.templates  = Stream.of();

        let marker = this;

        datas.each((value) => {
            if (typeof value === 'string') {
                if (rpath.test(value)) {
                    requestData(value)
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
        const privates = Privates(this);

        // DOM nonsense. If we are loading at connect add the loading attribute
        // after a couple of frames to allowing time for styled transitions to
        // initialise.
        (privates.loading && (privates.frame = requestAnimationFrame(() =>
            (privates.loading && (privates.frame = requestAnimationFrame(() =>
                (privates.loading && this.setAttribute('loading', ''))
            )))
        )));
    }
};

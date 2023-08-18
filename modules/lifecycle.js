

import { getInternals as Internals } from '../../dom/modules/element.js';

import Stream           from '../../fn/modules/stream.js';
import print            from './library/print.js';
//import { addLoading, removeLoading, setLoadingAsync } from './properties.js';
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

const onerror = window.DEBUG ?
    (e, element) => {
        /*removeLoading(element); */
        element.replaceWith(print(e));
        throw e;
    } :
    (e, element) => {
       /* removeLoading(element); */
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
                    /*addLoading(this);*/

                    // Wait a tick before requesting data. On initial page load
                    // we have not yet had time to populate rewrite URLs because
                    // custom element setup runs synchronously. Give us a tick
                    // so we can do that.
                    Promise
                    .resolve(value)
                    .then(requestData)
                    .then((data) => dataoutput.push(data))
                    .catch((e)   => onerror(e, marker, privates))
                    /*.finally(()  => removeLoading(this));*/
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
            const renderer = privates.renderer = new TemplateRenderer(template, {
                body: document.body,
                element: marker.parentElement,
                root: document.documentElement
            });

            renderer.push(data);
            marker.replaceWith(renderer.content);
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

    /*connect: function(shadow) {
        setLoadingAsync(this);
    },*/

    /*load: function(shadow) {
        removeLoading(this);
    }*/
};

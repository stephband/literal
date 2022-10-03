
import Privates         from '../../fn/modules/privates.js';
import Stream           from '../../fn/modules/stream.js';
import request          from '../library/request.js';
import TemplateRenderer from './renderer-template.js';

const rpath = /^\/|\.|^https?:\/\//;

/* Lifecycle */

/**
'slide-active'
Emitted by a slide when it is brought into scroll-snap alignment.
**/

function resolveData(value) {
    return rpath.test(value) ?
        request(value) :
        JSON.parse(value) ;
}

const onerror = window.DEBUG ? (e, element) => {
    element.loading = false;
    element.replaceWith(print(e));
    throw e;
} : (e, element) => {
    element.loading = false;
    if (element.frame) { cancelAnimationFrame(element.frame); }
    else { element.removeAttribute('loading'); }
    throw e;
} ;

export default {
    construct: function() {
        const privates   = Privates(this);
        const connects   = privates.connect   = Stream.broadcast();
        const load       = privates.load      = Stream.broadcast();
        const datas      = privates.datas     = Stream.of();
        const dataoutput = privates.datas     = Stream.of();
        const templates  = privates.templates = Stream.of();

        let marker = this;

        datas.each((value) => {
            if (typeof value === 'string') {
                if (rpath.test(value)) {
                    request(value)
                    .then((data) => dataoutput.push(data))
                    .catch((e) => onerror(e, this));

                    this.loading = true;
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
            load,
            data:     dataoutput,
            template: templates
        })
        .each((state) => {
            const { template, data } = state;
            const renderer = privates.renderer = new TemplateRenderer(template, marker.parentElement);

            renderer.push(data);
            //renderer.element = parent;
            //renderer.data    = data;
            marker.replaceWith(renderer.content);

            if (this.loading) {
                this.loading = false;
                this.removeAttribute('loading');
            }
        });

        // Resolve data from dataset attributes
        const keys = Object.entries(this.dataset);
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

    load: function (shadow) {
        const privates = Privates(this);
        privates.load.push(this);
    },

    connect: function(shadow) {
        const privates = Privates(this);
        privates.connects.push(true);

        // DOM nonsense. If we are loading at connect add the loading attribute
        // after a couple of frames to allowing time for styled transitions to
        // initialise.
        (this.loading && (this.frame = requestAnimationFrame(() =>
            (this.loading && (this.frame = requestAnimationFrame(() =>
                (this.loading && this.setAttribute('loading', ''))
            )))
        )));
    },

    disconnect: function(shadow) {
        const privates = Privates(this);
        privates.connects.push(false);
    }
};

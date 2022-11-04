//import { Data } from '../module.js';

const favourites = [];

export default {
    ids:   [],
    count: 0,
    toggle: function(id) {
        const ids = this.ids;
        const i   = this.ids.indexOf(id);

        if (i !== -1) {
            ids.splice(i, 1);
        }
        else {
            ids.push(id);
        }

        // We must mutate the Data() proxy of `this` so that literal templates
        // can detect the mutation. However, if this is being called from the
        // template `this` is already the data proxy...
        this.count = this.ids.length;
        console.log('Favourites', this.count);
    }
};

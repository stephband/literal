
import { State as Internals } from '../../dom/modules/element.js';

export default {
    /**
    data=""
    A path to a JSON file or JS module exporting data to be rendered.

    ```html
    <include-template src="#template" data="./data.json"></include-template>
    <include-template src="#template" data="./module.js"></include-template>
    ```

    Named exports are supported via the path hash:

    ```html
    <include-template src="#template" data="./module.js#namedExport"></include-template>
    ```

    Paths may be rewritten. This helps when JS modules are bundled into a single
    module for production.

    ```
    import { urls } from './literal.js';

    urls({
        './path/to/module.js': './path/to/production/bundle.js#namedExport'
    });
    ```

    The `data` attribute also accepts raw JSON:

    ```html
    <include-template src="#template" data='{"property": "value"}'></include-template>
    ```
    **/

    /**
    .data

    The `data` property may be set with a path to a JSON file or JS module, or a
    raw JSON string and behaves the same way as the `data` attribute. In
    addition it accepts a JS object or array.

    Getting the `data` property returns the data object currently being
    rendered. Note that if a path was set, this object is not available
    immediately, as the data must first be fetched.

    Technically, the returned data object is a _proxy_ of the object that has
    been set. Mutations to the data object are detected by the proxy and the
    DOM is rendered accordingly.
    **/

    data: {
        attribute: function(value) {
            this.data = value;
        },

        get: function() {
            const internal = Internals(this);
            return internal.renderer ?
                internal.renderer.data :
                null ;
        },

        set: function(value) {
            const internal = Internals(this);
            internal.datas.push(value);
        }
    },

    /**
    loading=""
    Read-only (pseudo-read-only) boolean attribute indicating status of
    `src` and `data` requests.
    **/

    /**
    .loading
    Read-only boolean indicating status of `src` and `data` requests.
    **/

    loading: {
        get: function() {
            const internal = Internals(this);
            return internal.loading;
        }
    }
};


import Privates       from '../../fn/modules/privates.js';
import create         from '../../dom/modules/create.js';
import { requestGet } from '../../dom/modules/request.js';

/* Properties */

export default {
    /**
    data=""
    Defines a JSON file or JS module containing data to be rendered. If a data
    attribute is not defined and empty object is used.

    To get data from a JSON file specify a path to JSON:

    ```html
    <include-literal src="#greetings" data="./package.json"></include-literal>
    ```

    Or import the default export of a JS module:

    ```html
    <include-literal src="#greetings" data="./modules/literal.js"></include-literal>
    ```

    Or import a named export of JS module:

    ```html
    <include-literal src="#greetings" data="./modules/literal.js#name"></include-literal>
    ```
    **/

    data: {
        attribute: function(value) {
            this.data = value;
        },

        get: function() {
            const privates = Privates(this);
            return privates.renderer ?
                privates.renderer.data :
                null ;
        },

        set: function(value) {
            const privates = Privates(this);
            privates.datas.push(value);
        }
    },

    loading: {
        /**
        loading=""
        Read-only (pseudo-read-only) boolean attribute indicating status of
        `src` and `data` requests.
        **/

        /**
        .loading
        Read-only (pseudo-read-only) boolean indicating status of `src` and
        `data` requests.
        **/
        value: false,
        writable: true
    },

    /**
    src=""
    Define a source template whose rendered content replaces this
    `<include-literal>`. This is a required attribute and must be in
    the form of a fragment identifier pointing to a `template` element
    in the DOM.
    **/

    src: {
        attribute: function(value) {
            const privates = Privates(this);

            if (!/^#/.test(value)) {
                // Flag loading until we connect, at which point we add the
                // loading attribute that may be used to indicate loading. Why
                // wait? Because we are not in the DOM yet, and if we want a
                // loading icon to transition in the transition must begin after
                // we are already in the DOM.
                this.loading = true;
                requestGet(value).then((html) => {
                    privates.templates.push(create('fragment', html));
                });

                return;
            }

            const id       = value.slice(1);
            const template = document.getElementById(id);

            if (!template) {
                throw new Error('<include-literal src="' + value + '"> Template not found');
            }

            privates.templates.push(template);
        }
    }
};

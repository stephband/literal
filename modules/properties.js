
import Privates        from '../../fn/modules/privates.js';
import getTemplate     from '../modules/get-template.js';
import requestTemplate from './request-template.js';

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
        Read-only boolean indicating status of `src` and `data` requests.
        **/

        get: function() {
            const privates = Privates(this);
            return privates.loading;
        }
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

            if (/^#/.test(value)) {
                const template = getTemplate(value);
                privates.templates.push(template);
                return;
            }

            // Flag loading until we connect, at which point we add the
            // loading attribute that may be used to indicate loading. Why
            // wait? Because we are not in the DOM yet, and if we want a
            // loading icon to transition in the transition must begin after
            // we are already in the DOM.
            this.loading = true;
            requestTemplate(value).then((template) => {
                privates.templates.push(template);
            });
        }
    }
};

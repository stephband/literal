
import { getInternals } from '../../../dom/modules/element.js';
import { rewriteURL }   from '../../modules/urls.js';
import parseNameValues  from '../../modules/parse-name-values.js';

export default {
    /** tag=""
    Defines the tag name of a new custom element.

    ```html
    <template is="literal-element" tag="play-list">
    ```

    Being a custom element definition, clearly the tag name must conform to the
    rules for custom element names (ie. it must contain a dash).
    **/

    tag: {
        attribute: function(value) {
            const internal = getInternals(this);
            internal.tag = value;
        }
    },

    /** attributes=""
    Defines attributes of the new custom element as a list of names:

    ```html
    <template is="literal-element" attributes="previous next" tag="play-list">
    ```

    Attributes may be given a type. A typed attribute defines both an attribute
    and a property of the new custom element. The type defines the behaviour of
    the attribute and type of value of the property:

    ```html
    <template is="literal-element" attributes="loop:boolean controls:tokens" tag="play-list">
    ```

    Possible types are:

    - `:boolean` – a boolean attribute, boolean property
    - `:number`  – a string attribute, number property
    - `:string`  – a string attribute, string property
    - `:tokens`  – a string attribute, TokenList property
    - `:src`     – a string attribute, object property

    Attribute values are available inside the template scope as properties of
    `data`:

    ```html
    <template is="literal-element" tag="play-list" attributes="loop:boolean controls:tokens">
        <p>Looping is ${ data.loop ? 'on' : 'off' }.</p>
        <p>Play button is ${ data.controls.includes('play') ? 'shown' : 'hidden' }.</p>
    </template>
    ```
    **/

    attributes: {
        attribute: function(value) {
            const internal = getInternals(this);
            internal.attributes = parseNameValues([], value);
        }
    },

    /** src=""
    Imports a JS module. The module's `default` export may be an object of
    lifecycle callbacks, while any named exports are imported into the template
    scope.

    ```html
    <template is="literal-element" tag="my-elem" src="./path/to/module.js">
        From the module's named exports: ${ text }
    </template>
    ```

    And in `module.js`:

    ```js
    // Export lifecycle
    export default {
        construct: function(shadow, internals) { ... },
        connect:   function(shadow, internals) { ... }
    }

    // Export scope variables
    export const text = 'I say what';
    ```
    **/

    src: {
        attribute: function(value) {
            const internal = getInternals(this);

            internal.src = import(rewriteURL(value)).catch((e) => {
                throw new Error('<' + internal.tag + '> not defined, failed to fetch src "' + value + '" ' + e.message);
            });
        }
    },

    /* Prefetching stylesheets DOES NOT PREVENT FOUC. Pants. */

    /* stylesheets=""

    A list of stylesheets urls. They are loaded before the element is defined,
    preventing a flash of unstyled content.

    ```html
    <template is="literal-element" tag="my-elem" stylesheets="./path/to/style1.css ./path/to/style2.css">
    ```
    */
    /*
    stylesheets: {
        attribute: function(value) {
            const internals = getInternals(this);
            internals.stylesheets = value.split(/\s+/);
        }
    }
    */
}

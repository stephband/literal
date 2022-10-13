/**
<include-template>

A `include-template` may be placed pretty much anywhere in your HTML, enabling
the insertion of chunks of dynamic, JS-rendered DOM wherever you like in a
document.

A `include-template` finds a source template identified by its `src` attribute,
fetches JSON or imports a module referred to by its `data` attribute, renders
attributes and text found to contain literal tags, then replaces itself with
the rendered result.

A `include-template` may contain fallback content, in case any of that fails.

```html
<template id="greetings">
    Hello ${ data.name }.
</template>

<include-template src="#greetings" data="/users/1.json">
    Fallback content.
</include-template>
```

Multiple `data-` attributes may be declared, their values become properties of
the `data` object inside the template:

```
<include-template src="#add-to-collections-thumb" data-pk="34" ... ></include-template>
```

Or a single `data` attribute can be used to pass JSON to use as the `data`
object inside the template:

```
<include-template src="#add-to-collections-thumb" data='{"pk":34, ... }'></include-template>
```

Both `data` and `data-` attributes also accept URLs. A URL is used to fetch a
.json file...

```
<include-template src="#greetings" data="/users/1.json"></include-template>
```

...or import the default export of a .js module:

```
<include-template src="#greetings" data="/user-module.js"></include-template>
```

**/

import element, { State as Internals } from '../dom/modules/element.js';

import lifecycle       from './modules/lifecycle.js';
import properties      from './modules/properties.js';
import getTemplate     from './modules/get-template.js';
import requestTemplate from './modules/request-template.js';

// Log registration to console
window.console && window.console.log('%c<include-template>%c documentation: stephen.band/literal/', 'color: #3a8ab0; font-weight: 600;', 'color: #888888; font-weight: 400;');

const assign = Object.assign;

export default element('include-template', lifecycle, assign({
    /**
    src=""
    Define a source template whose rendered content replaces this
    `<include-template>`. This is a required attribute and must be in
    the form of a fragment identifier pointing to a `template` element
    in the DOM.
    **/

    src: {
        attribute: function(value) {
            const internal = Internals(this);

            if (/^#/.test(value)) {
                const template = getTemplate(value);
                internal.templates.push(template);
                return;
            }

            // Flag loading until we connect, at which point we add the
            // loading attribute that may be used to indicate loading. Why
            // wait? Because we are not in the DOM yet, and if we want a
            // loading icon to transition in the transition must begin after
            // we are already in the DOM.
            this.loading = true;
            requestTemplate(value).then((template) => {
                internal.templates.push(template);
            });
        }
    }
}, properties));

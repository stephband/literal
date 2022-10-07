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

import element    from '../dom/modules/element.js';
import lifecycle  from './modules/lifecycle.js';
import properties from './modules/properties.js';

export default element('include-template', lifecycle, properties);

// Log registration to console
window.console && window.console.log('%c<include-template>%c documentation: stephen.band/literal/', 'color: #3a8ab0; font-weight: 600;', 'color: #888888; font-weight: 400;');

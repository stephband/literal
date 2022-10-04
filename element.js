/**
<include-literal>

A `include-literal` may be placed pretty much anywhere in your HTML, enabling
the insertion of chunks of dynamic, JS-rendered DOM wherever you like in a
document.

A `include-literal` finds a source template identified by its `src` attribute,
fetches JSON or imports a module referred to by its `data` attribute, renders
attributes and text found to contain literal tags, then replaces itself with
the rendered result.

A `include-literal` may contain fallback content, in case any of that fails.

```html
<template id="greetings">
    Hello ${ data.name }.
</template>

<include-literal src="#greetings" data="/users/1.json">
    Fallback content.
</include-literal>
```

Multiple `data-` attributes may be declared, their values become properties of
the `data` object inside the template:

```
<include-literal src="#add-to-collections-thumb" data-pk="34" ... ></include-literal>
```

Or a single `data` attribute can be used to pass JSON to use as the `data`
object inside the template:

```
<include-literal src="#add-to-collections-thumb" data='{"pk":34, ... }'></include-literal>
```

Both `data` and `data-` attributes also accept URLs. A URL is used to fetch a
.json file...

```
<include-literal src="#greetings" data="/users/1.json"></include-literal>
```

...or import the default export of a .js module:

```
<include-literal src="#greetings" data="/user-module.js"></include-literal>
```

**/

import element    from '../dom/modules/element.js';
import lifecycle  from './modules/lifecycle.js';
import properties from './modules/properties.js';

export default element('include-literal', lifecycle, properties);

// Log registration to console
window.console && window.console.log('%c<include-literal>%c documentation: stephen.band/literal/', 'color: #3a8ab0; font-weight: 600;', 'color: #888888; font-weight: 400;');

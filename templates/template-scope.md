### Extending the template scope

To include a function in the scope of all Literal templates:

```js
import { scope } from './literal/module.js';
scope.myFunction = () => { ... };
```

Note that this must be done before `literal-html` or `literal-element` have been
imported. Those imports declare and compile their templates, at which point
their scopes cannot be changed. Put the above code into a setup script and
import that before importing the templates.

```js
import './my-literal-setup.js';
import './literal/literal-html/module.js';
import './literal/literal-element/module.js';
```

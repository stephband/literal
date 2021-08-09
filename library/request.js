
/**
requestData(url)

Takes a `url` pointing to either a `.json` file, in which case it fetches and 
parses it, or a `.js` file, which it imports as a module, and returns a 
promise representing the result.

```
requestData('./path/to/data.json');
```

Where a `url` to a module is relative it is normalised to `window.location` so 
that imports written in templates are treated relative to their location 
(dynamic `import()` would otherwise try and import relative to this 
`request.js` module).

```
requestData('./path/to/module.js');
```

By default a module request imports the default export. If `url` contains a 
`#fragment` identifier, the named export corresponding to the identifier is 
imported.

```
requestData('./path/to/module#named');
```

If the fragment identifier is also post-fixed with parameters then that named 
export is treated as a constructor function and called:

```
requestData('./path/to/module#named("parameter")');
```

To construct a default export use the name `default`:

```
requestData('./path/to/module#default("parameter")');
```
**/

import overload from '../../fn/modules/overload.js';
import cache from '../../fn/modules/cache.js';
import { requestGet } from '../../dom/modules/request.js';

//const DEBUG = window.DEBUG === true || window.DEBUG && window.DEBUG.includes('literal');

const rextension = /\.([\w-]+)(?:#|\?|$)/;
const rfragment  = /#(\w+)(?:\(([^\)]*)\))?$/;
const defaultexp = ['', 'default', ''];
const empty = [];

export default overload((url) => (rextension.exec(url) || empty)[1], {
    'js': (url) => {
        // Support named exports via the #fragment identifier
        const [string, name, params] = rfragment.exec(url) || defaultexp;

        // Rewrite relative import URLs to be absolute, taking the page as their
        // relative root
        const absolute = url[0] === '.' ?
            new URL(url, window.location) :
            url ;
console.log(absolute + '');
        // Otherwise use the export as data directly
        return import(absolute).then((data) => data[name]) ;
    },

    // Cache JSON requests in memory so that all requests to a given URL result 
    // in the same object.
    'json': cache((url) => requestGet(url))
});

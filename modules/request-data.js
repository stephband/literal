
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

import get            from '../../fn/modules/get.js';
import overload       from '../../fn/modules/overload.js';
import cache          from '../../fn/modules/cache.js';
import { requestGet } from '../../dom/modules/request.js';
import { rewriteURL } from './urls.js';

const rextension = /\.([\w-]+)(?:#|\?|$)/;
const empty      = [];

const requestData = overload((url) => (rextension.exec(url.pathname) || empty)[1], {
    js: cache((url) => {
        // Get named import from hash
        const src  = url.origin + url.pathname + url.search;
        const name = url.hash || 'default';

        // Return promise of imported named module
        return import(src).then(get(name));
    }),

    default: cache(requestGet)
});

export default function(path) {
    // Get rewritten URL
    const url = rewriteURL(path);

    // Return promise of data
    return requestData(url);
}


/**
requestData(url)

Takes a `url` pointing to either a `.json` file (in which case it fetches and
parses it) or a `.js` file (which it imports as a module), and returns a
promise of the result.

```
requestData('./path/to/data.json');
```

Where a `url` to a module is a relative URL it is normalised to `window.location`
so that imports written in templates are treated correctly (dynamic `import()`
would otherwise try and import relative to this module).

```
requestData('./path/to/module.js');
```

By default a module request imports the default export. If `url` contains a
`#fragment` identifier, the named export corresponding to the identifier is
imported.

```
requestData('./path/to/module#named');
```
**/

/*
If the fragment identifier is also post-fixed with parameters then that named
export is treated as a constructor function and called:

```
requestData('./path/to/module#named("parameter")');
```

To construct a default export use the name `default`:

```
requestData('./path/to/module#default("parameter")');
```
*/

import get            from 'fn/get.js';
import overload       from 'fn/overload.js';
import cache          from 'fn/cache-by-key.js';
import { rewriteURL } from './urls.js';

const rextension = /\.([\w-]+)(?:#|\?|$)/;
const empty      = [];

const request = overload((url) => (rextension.exec(url.pathname) || empty)[1], {
    js: cache((url) => {
        // Get named import from hash
        const src  = url.origin + url.pathname + url.search;
        const name = url.hash.slice(1) || 'default';
        // Return promise of imported named module
        return import(src).then(get(name));
    }),

    default: cache((url) => fetch(url).then((response) => {
        if (!response.ok) {
            throw new Error(`Literal failed to fetch data – ${response.status}`);
        }

        return response.json();
    }))
});

export default function requestData(path) {
    // Get rewritten URL
    const url = rewriteURL(path);

    // Return promise of data
    return request(url);
}

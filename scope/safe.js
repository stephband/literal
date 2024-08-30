
import create from 'dom/create.js';

/**
safe(html)
Parses `html` and returns a fragment.

By default Literal safely renders strings into the DOM via `node.textContent`,
preventing injection attacks. When you need to render HTML (and your data is
known to be safe) call `safe()` on it. Literal appends the resulting fragment
directly.
**/

export default function safe(html) {
    return create('fragment', html);
}

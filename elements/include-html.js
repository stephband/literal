
/**
<include-html>

A `include-html` may be placed pretty much anywhere in your HTML, enabling
the insertion of static content.

A `include-html` finds a source template identified by its `src` attribute
then replaces itself with the cloned content.

A `include-html` may contain fallback content, in case any of that fails.

```html
<template id="greetings">
    Hello world.
</template>

<include-html src="#greetings">
    Fallback content.
</include-html>
```
**/

import element        from '../../dom/modules/element.js';
import includeHTML    from '../library/include-html.js';
import print          from '../library/print.js';

const onerror = window.DEBUG ? (e, element) => {
    element.loading = false;
    element.replaceWith(print(e));
    throw e;
} : (e, element) => {
    element.loading = false;
    if (element.frame) { cancelAnimationFrame(element.frame); }
    else { element.removeAttribute('loading'); }
    throw e;
} ;

element('<include-html>', {
    construct: function() {
        if (window.DEBUG && !this.hasAttribute('src')) {
            console.error('<include-html> a src attribute is required', this);
        }

        this.promise = new Promise((resolve, reject) => {
            this.resolveSrc = resolve;
            this.rejectSrc = reject;
        })
        .catch((e) => onerror(e, this));
    },

    connect: function() {
        // If we are loading at connect time, add the loading attribute after a
        // couple of frames, allowing time for any styled transition to start
        (this.loading && (this.frame = requestAnimationFrame(() =>
            (this.loading && (this.frame = requestAnimationFrame(() =>
                (this.loading && this.setAttribute('loading', ''))
            )))
        )));

        // Cue up first render and replace
        this.promise.then((dom) => {
            this.loading = false;
            this.replaceWith(dom);
        });
    }
}, {
    loading: {
        /**
        loading=""
        Read-only (pseudo-read-only) boolean attribute indicating status of
        `src` request.
        **/

        /**
        .loading
        Read-only boolean indicating status of `src` request.
        **/

        value: false,
        writable: true
    },

    /**
    src=""
    Define a source document or node whose cloned content replaces this
    `<include-html>` element. This is a required attribute.
    **/

    src: {
        attribute: function(src) {
            if (!src) {
                return this.rejectSrc(new Error('<include-html> source src="' + src + '" is empty'));
            }

            // Flag loading until we connect, at which point we add the
            // loading attribute that may be used to indicate loading. Why
            // wait? Because we are not in the DOM yet, and if we want a
            // loading icon to transition in the transition must begin after
            // we are already in the DOM.
            this.loading = true;

            // includeHTML may return a fragment or a promise
            this.resolveSrc(includeHTML(src));
        }
    }
});

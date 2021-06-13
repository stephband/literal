
/** 
<template is="literal-template">

Literal templates bind the DOM to data, parsing text content, classes and 
attributes as JS template literals. Here is a literal template that prints out 
data when rendered:

```html
<template is="literal-template" id="log">
    <pre><code>${ data }</code></pre>
</template>
```

Use an `<include-content>` to render this template into the document with some 
data:

```html
<p>Ooo matron, what a lovely package.json:</p>
<include-content src="#log" data="./package.json"></include-content>
```
**/


/* Register customised built-in element <template is="literal-template"> */

import element from '../../dom/modules/element.js';
import TemplateRenderer from '../modules/renderers/template-renderer.js';

export default element('<template is="literal-template">', {
    construct: function() {
        // Keep tabs on the number of renders
        this.instanceCount = 0;
    },

    properties: {
        /** 
        .render(data)
        Returns a promise containing a document fragment of DOM rendered from
        the template contents.
        **/
        render: {
            value: function(data) {
                const renderer = new TemplateRenderer(this);
                ++this.instanceCount;
                renderer.render(data);
                return renderer.fragment;
            }
        }
    }
});

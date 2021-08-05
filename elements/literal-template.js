
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

Use an `<literal-include>` to render this template into the document with some 
data:

```html
<p>Ooo matron, what a lovely package.json:</p>
<literal-include src="#log" data="./package.json"></literal-include>
```
**/


/* Register customised built-in element <template is="literal-template"> */

import element from '../../dom/modules/element.js';
import TemplateRenderer from '../modules/renderers/template-renderer.js';

export default element('<template is="literal-template">', {}, {
    /** 
    .Renderer()
    Returns a TemplateRenderer instance.
    **/
    Renderer: {
        value: function(data) {
            return new TemplateRenderer(this);
        }
    }
});

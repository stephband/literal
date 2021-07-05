
/** 
<include-content>

Include templates allow you to easily mix static and dynamic content, inserting
chunks of JS-rendered DOM wherever you like in your documnent.

An `<include-content>` finds a source template identified by its `src` attribute
and replaces itself with the template content:

```html
<template id="greetings">
    Hello you.
</template>

<include-content src="#greetings"></include-content>
```

If the source template has a `.render()` method (as is the case with the 
customised `<template is="literal-template">`), its `.render()` method is called 
with data read from `data-` attributes. The `<include-content>` is replaced 
with the result:

```html
<template is="literal-template" id="greetings">
    Hello ${ data.name }.
</template>

<include-content src="#greetings" data-name="Bartholemew"></include-content>
```

To import data from an external source such as a JSON file specify a `data` 
attribute with a path:

```html
<include-content src="#greetings" data="./package.json"></include-content>
```

Or import the default export of a JS module:

```html
<include-content src="#greetings" data="./modules/literal.js"></include-content>
```

Or indeed the named export of JS module:

```html
<include-content src="#greetings" data="./modules/literal.js#name"></include-content>
```

Should the `include-content` contain html, note that that content is 
displayed until templated content has been fetched and rendered, allowing you
to provide default or fallback content.
**/

import element from '../../dom/modules/element.js';
import requestData from '../modules/request-data.js';

element('include-content', {
    construct: function() {
        if (!this.hasAttribute('src')) {
            console.error('<include-content> src attribute required', this);
        }

        const srcPromise = new Promise((resolve, reject) => {
            this.resolveSrc = resolve;
            this.rejectSrc = reject;
        });

        const dataPromise = new Promise((resolve, reject) => {
            this.resolveData = resolve;
            this.rejectData = reject;
        });

        srcPromise.then((template) => {
            // Template requires data to be rendered
            if (template.render) {
                return dataPromise.then((data) => {
                    this.after(template.render(data));
                    this.remove();
                });
            }

            // Template is a standard template with .content property
            this.after(template.content.cloneNode(true));
            this.remove();
        })
        .catch((message) => console.error(message, this));
    },

    connect: function() {
        // Where a data attribute has not been defined resolve with an 
        // empty object
        this.resolveData({});
    },

    properties: {
        /** 
        data="path/to/file.json"
        Define a JSON file used to render templates (that have a `.render(data)` 
        method). If a data attribute is not defined and empty object is used.
        **/
        
        data: {
            attribute: function(value) {
                this.resolveData(requestData(value));
            }
        },

        /** 
        src="#id"
        Define a source template whose rendered content replaces this
        `include-content`. This is a required attribute.
        **/

        src: {
            attribute: function(value) {
                if (!value) {
                    return this.rejectSrc('<include-content> source src="' + value + '" is empty');
                }

                const id = value.replace(/^#/, '');
                const template = document.getElementById(id);

                if (!template) {
                    return this.rejectSrc('<include-content> src template not found');
                }

                this.resolveSrc(template);
            }
        }
    }
});

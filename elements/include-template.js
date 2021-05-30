
/** 
<include-template>

Include templates allow you to easily mix static and dynamic content, inserting
chunks of JS-rendered DOM wherever you like in your documnent.

An `<include-template>` finds a source template identified by its `src` attribute
and replaces itself with the template content:

```html
<template id="greetings">
    Hello you.
</template>

<include-template src="#greetings"></include-template>
```

If the source template has a `.render()` method (as is the case with the 
customised `<template is="literal-template">`), its `.render()` method is called 
with data read from `data-` attributes. The `<include-template>` is replaced 
with the result:

```html
<template is="literal-template" id="greetings">
    Hello ${ data.name }.
</template>

<include-template src="#greetings" data-name="Bartholemew"></include-template>
```

To import data from an external source such as a JSON file specify a `data` 
attribute with a path:

```html
<include-template src="#greetings" data="./package.json"></include-template>
```

Or import the default export of a JS module:

```html
<include-template src="#greetings" data="./modules/literal.js"></include-template>
```

Or indeed the named export of JS module:

```html
<include-template src="#greetings" data="./modules/literal.js#namedExport"></include-template>
```

Should the `include-template` contain static content, note that that content is 
displayed until templated content has been fetched and rendered, allowing you
to provide default or fallback content.
**/

import overload from '../../fn/modules/overload.js';
import element  from '../../dom/modules/element.js';
import { requestGet } from '../../dom/modules/request.js';

const DEBUG = window.DEBUG === true || window.DEBUG && window.DEBUG.includes('literal');

const rextension = /\.([\w-]+)(?:#|\?|$)/;
const rfragment  = /#(\w+)(?:\(([^\)]*)\))?$/;
const defaultexp = ['', 'default', ''];

const request = overload((url) => rextension.exec(url)[1], {
    'js': (url) => {
        // Support named exports via the #fragment identifier
        const [string, name, params] = rfragment.exec(url) || defaultexp;

        // Rewrite relative import URLs to be absolute, taking the page as their
        // relative root
        const absolute = url[0] === '.' ?
            new URL(url, window.location) :
            url ;

        return params ?
            // Where params have been captured, assume the export is a constructor
            // and call it with params as values
            import(absolute)
            .then((data) => {
                if (typeof data[name] !== 'function') {
                    throw new Error('Export ' + absolute + ' is not a function');
                }

                return new data[name](...JSON.parse('[' + params.replace(/'/g, '"') + ']'))
            }) :
            // Otherwise use the export as data directly
            import(absolute)
            .then((data) => data[name]) ;
    },

    'json': (url) => requestGet(url)
});

element('include-template', {
    construct: function() {
        if (!this.hasAttribute('src')) {
            console.error('<include-template> src attribute required', this);
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
        });
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
                this.resolveData(request(value));
            }
        },

        /** 
        src="#id"
        Define a source template whose rendered content replaces this
        `include-template`. This is a required attribute.
        **/

        src: {
            attribute: function(value) {
                if (!value) {
                    console.error('<include-template> source src="' + value + '" is empty');
                    this.rejectSrc();
                    return;
                }

                const id = value.replace(/^#/, '');
                const template = document.getElementById(id);

                if (!template) {
                    console.error('<include-template src="' + value + '"> src template not found', this);
                    this.rejectSrc();
                    return;
                }

                this.resolveSrc(template);
            }
        }
    }
});

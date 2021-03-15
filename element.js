
/* Register customised built-in element <template is="literal-template"> */

import Literal from './module.js';
import element from '../dom/modules/element.js';

var supportsCustomBuiltIn = false;

element('literal-template', {
    extends: 'template',

    properties: {},

    attributes: {
        src: function(src) {
            this.options.src = src;
        },

        fn: function(fn) {
            this.options.fn = fn;
        }
    },

    construct: function(elem) {
        // Flag
        supportsCustomBuiltIn = true;
    },

    connect: function(elem) {
        //if (DEBUG) { logNode(elem, elem.options.fn, elem.options.src); }

        const src = this.getAttribute('src');

        if (src) {
            const id       = src.replace(/^#/, '');
            const template = this.getElementById(id);
            const render   = Literal(template);
            
            console.log('Todo: Wait for data');
            
            // Replace literal-template with rendered nodes
            render({}).then((nodes) => {
                elem.after(...nodes);
                elem.remove();
            });
        }
    }
});

// If one has not been found already, test for customised built-in element
// support by force creating a <template is="literal-template">
if (!supportsCustomBuiltIn) {
    document.createElement('template', { is: 'literal-template' });
}

// If still not supported, fallback to a dom query for [is="literal-template"]
if (!supportsCustomBuiltIn) {
    log("Browser does not support custom built-in elements so we're doin' it oldskool selector stylee.");

    window.addEventListener('DOMContentLoaded', function() {
        window.document
        .querySelectorAll('[is="literal-template"]')
        .forEach((template) => {
            const fn  = template.getAttribute(config.attributeFn) || undefined;
            const src = template.getAttribute(config.attributeSrc) || undefined;
    
            if (fn) {
                Sparky(template, { fn: fn, src: src });
            }
            else {
                // If there is no attribute fn, there is no way for this sparky
                // to launch as it will never get scope. Enable sparky templates
                // with just an include by passing in blank scope.
                Sparky(template, { src: src }).push({});
            }
        });
    });
}

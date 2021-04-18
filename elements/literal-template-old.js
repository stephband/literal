
/* Register customised built-in element <template is="literal-template"> */

import Literal  from '../module.js';
import element  from '../../dom/modules/element.js';
import { compileValue } from '../modules/compile-string.js';
import { requestGet as request } from '../../dom/modules/request.js';
import log      from '../../bolt/literal/modules/log-browser.js';

var supportsCustomBuiltIn = false;

const rejectSrc   = Promise.resolve('Cannot .render() missing src template');
const nullPromise = Promise.resolve(null);

function reject() {
    return rejectSrc;
}

element('literal-template', {
    extends: 'template',

    construct: function() {
        // Default to using this as template src
        this.template = this;
    
        // Where template is just whitespace don't compile it as a template
        this.render = /^\s*$/.test(this.innerHTML) ?
            reject :
            Literal(this.template) ;
        
        // Keep tabs on the number of renders
        this.renderCount = 0;
    
        // Flag support
        supportsCustomBuiltIn = true;
    },

    properties: {
        update: {
            value: function update() {
                if (!this.data) { return; }

                const data    = this.data;
                const promise = this.render(data);

                // On first render add nodes to DOM
                if (!this.renderCount++) {
                    promise.then((nodes) => {
                        this.after(...nodes);
                        this.remove();
                    })
                }

                return this;
            }
        },

        src: {
            attribute: function(value) {
                if (value) {
                    const id = value.replace(/^#/, '');
                    this.template = document.getElementById(id);
                    if (this.template) {
                        this.render = Literal(this.template);
                        log('source ', '#' + id, 'yellow');
                        this.update();
                    }
                }
                else {
                    this.template = this;
                    this.render = /^\s*$/.test(this.innerHTML) ?
                        reject :
                        Literal(this.template) ;
                    this.update();
                }
            }
        },

        data: {
            attribute: function(value) {
                const promise = !value ? nullPromise :
                    // Where data contains ${...}, compile and render value as literal
                    /^\$\{/.test(value) ? compileValue(value)() :
                    // Request JSON
                    request(value) ;
    
                promise.then((data) => {
                    this.data = data;
                    this.update();
                });
            }
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

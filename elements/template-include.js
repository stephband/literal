
import element from '../../dom/modules/element.js';
import Literal from '../module.js';

export default element('template-include', {
    // 
    //extends:    Name of tag to extend to make the element a custom built-in
    //mode:       'open' or 'closed', defaults to 'closed'
    //focusable:  true or false, defaults to true
    focusable:  false,

    //template:   HTML string or template node or id or function used to populate the shadow DOM

    properties: {
        "src": {
            attribute: function(value) {
                console.log('template-include.src =', value);
            },

            get: function() {
                this.getAttribute('src');
            },
            
            set: function(value) {
                this.setAttribute('src', value);
            }
        },

        "render": {        
            value: function(data) {
                const id       = this.src.replace(/^#/, '');
                const template = document.getElementById(id);
                this.render = Literal(template);
                return this.render(data).then((nodes) => {
                    this.after(...nodes);
                    this.remove();
                    return nodes;
                });
            }
        }
    },

    // Lifecycle handlers
    //construct:  called during element construction
    //connect:    called when element added to DOM
    construct: function(elem) {
        console.log('construct', elem);
        //const template = document.getElementById(this.src.replace(/^#/, ''));
    },

    connect: function(elem) {
        console.log('connect', elem);
    }

    //load:       called when stylesheets load
    //disconnect: called when element removed from DOM
    //enable:     called when form element enabled
    //disable:    called when form element disabled
    //reset:      called when form element reset
    //restore:    called when form element restored
});

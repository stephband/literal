
import noop       from '../../fn/modules/noop.js';
import overload   from '../../fn/modules/overload.js';
import { toType } from '../../dom/modules/node.js';

import library from '../../bolt/literal/modules/lib.js';
import { compileStringRender, compileValueRender } from '../../bolt/literal/modules/compile.js';
import log     from '../../bolt/literal/modules/log-browser.js';
import decode  from '../../bolt/literal/modules/decode.js';

import { isCustomElement, setText, setBooleanProperty, setPropertyChecked, setPropertyValue } from './dom.js';

const DEBUG = window.DEBUG === true;

const config = {
    elements: {
        // Global
        '*':        ['id', 'title', 'style', 'class', 'hidden'],

        // HTML
        'a':        ['href'],
        'button':   ['disabled'],
        'command':  ['disabled'],
        'form':     ['name', 'method', 'action'],
        'fieldset': ['name', 'disabled'],
        'img':      ['alt', 'src'],
        'input':    ['name', 'disabled'],
        'keygen':   ['name', 'disabled'],
        'label':    ['for'],
        'link':     ['href'],
        'meta':     ['name', 'content'],
        'meter':    ['min', 'max', 'low', 'high', 'value'],
        'option':   ['disabled', 'value'],
        'optgroup': ['disabled'],
        'output':   ['name', 'for'],
        'param':    ['name'],
        'progress': ['max', 'value'],
        'select':   ['disabled', 'name'],
        'textarea': ['disabled', 'name'],
        'time':     ['datetime'],

        // SVG
        'circle':   ['cx', 'cy', 'r', 'transform'],
        'ellipse':  ['cx', 'cy', 'rx', 'ry', 'transform'],
        'g':        ['transform'],
        'line':     ['x1', 'x2', 'y1', 'y2', 'transform'],
        'path':     ['d', 'transform'],
        'polygon':  ['points', 'transform'],
        'polyline': ['points', 'transform'],
        'rect':     ['x', 'y', 'width', 'height', 'rx', 'ry', 'transform'],
        'svg':      ['viewbox'],
        'text':     ['x', 'y', 'dx', 'dy', 'text-anchor', 'transform'],
        'use':      ['x', 'y', 'href', 'transform']
    },

    types: {
        // Form types
        'button':   ['name', 'value'],
        'checkbox': ['required', 'value', 'checked'],
        'date':     ['required', 'min', 'max', 'step', 'value'],
        'hidden':   ['value'],
        'image':    ['src'],
        'number':   ['required', 'min', 'max', 'step', 'value'],
        'radio':    ['required', 'value', 'checked'],
        'range':    ['min', 'max', 'step', 'value'],
        'reset':    ['value'],
        'submit':   ['value'],
        'time':     ['required', 'min', 'max', 'step', 'value'],

        // Defaults
        'default':  ['required', 'value']
    }
};

const rliteral = /\$\{/;


/** 
compileAttributes(renderers, vars, node, names)
**/

function compileAttr(renderers, vars, node, name) {
    const string = node.getAttribute(name);
    if (!string || !rliteral.test(string)) { return; }

    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push((...params) => 
        render(...params)
        .then((value) => {
            if (value === node.getAttribtue(name)) { return 0; }
            // Mutate DOM
            node.setAttribute(name, value);
            // Return number of mutations
            return 1;
        })
    );
}

function compileBoolean(renderers, vars, node, name) {
    const string = node.getAttribute(name);
    if (!string || !rliteral.test(string)) { return; }

    node.removeAttribute(name);
    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push((...params) => 
        render(...params).then((value) => setBooleanProperty(node, name, value))
    );
}

function compileClass(renderers, vars, node, name) {
    const string = node.getAttribute('class');
    if (!string || !rliteral.test(string)) { return; }

    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push((...params) => 
        render(...params)
        .then((value) => {
            console.log('Todo: render class');
        })
    );
}

function compileValue(renderers, vars, node) {
    const string = node.getAttribute('value');
    if (!string || !rliteral.test(string)) { return; }

    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push((...params) => 
        render(...params)
        .then((value) => setPropertyValue(node, value))
    );
}

function compileChecked(renderers, vars, node) {
    const string = node.getAttribute('value');
    if (!string || !rliteral.test(string)) { return; }

    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push((...params) => 
        render(...params)
        .then((value) => setPropertyChecked(node, value))
    );
}

const compileAttribute = overload((renderers, vars, node, name) => name, {
    'checked': compileChecked,

    'class': function compileClass(renderers, vars, node, name) {
        const string = node.getAttribute('class');
        if (!string || !rliteral.test(string)) { return; }    
        const render = compileValueRender(library, vars, string, 'arguments[1]');
        renderers.push((...params) => 
            render(...params)
            .then((value) => {
                console.log('Todo: render class');
            })
        );
    },

    'datetime': function compileClass(renderers, vars, node, name) {
        console.log('Todo: compile datetime');
    },

    'disabled': compileBoolean,
    'hidden':   compileBoolean,
    'required': compileBoolean,

    'value': overload((renderers, vars, node, name) => ('' + node.type), {
        //'checkbox':  compileValueChecked,
        //'date':    compileValueDate,
        //'number':  compileValue,
        //'range':   compileValue,
        //'select-multiple': compileValueArray,
        'default': compileValue,
        'undefined': (renderers, vars, node) => {
            compileAttr(renderers, vars, node, 'value');
        }
    }),

    'default':  compileAttr
});

function compileAttributes(renderers, vars, node, names) {
    if (!names) { return; }
    var n = -1;
    while (names[++n]) {
        compileAttribute(renderers, vars, node, names[n]);
    }
}


/**
compileElement()
**/

function compileText(renderers, vars, node) {
    const string = node.nodeValue;

    if (string && rliteral.test(string)) {
        const render = compileStringRender(library, vars, decode(string), 'arguments[1]');
        renderers.push((...params) =>
            render(...params)
            .then((value) => setText(node, value))
        );
    }
}

function compileChildren(renderers, vars, node, Literal) {
    const children = node.childNodes;

    if (children) {
        let n = -1;
        while(children[++n]) {
            compileNode(renderers, vars, children[n], Literal);
        }
    }
}

function compileTag(renderers, vars, node) {
    // Compile global attributes    
    compileAttributes(renderers, vars, node, config.elements['*']);

    // Compile element attributes
    const tag   = node.tagName.toLowerCase();
    const names = config.elements[tag || 'default'];
    compileAttributes(renderers, vars, node, names);
}

function compileType(renderers, vars, node) {
    // Compile element type attributes
    const type  = node.type;
    if (!type) { return; }
    const names = config.types[type || 'default'];
    compileAttributes(renderers, vars, node, names);
}

const compileElement = overload((renderers, vars, node) => node.tagName.toLowerCase(), {
    // Ignore SVG <defs>, which for our purposes we consider as equivalent to 
    // the inert content of HTML <template>
    'defs': noop,

    // <include src="#template" data="${js}"></include>
    'include': function(renderers, vars, node, Literal) {
        const id       = node.getAttribute('src').replace(/^#/, '');
        const template = document.getElementById(id);           
        const render   = Literal(template);
        var count = 0;
        
        log('include', node.getAttribute('src'), 'yellow');
        
        renderers.push(function first(data) {
            // Render and replace include node with rendered dom
            return ++count === 1 ?
                render.apply(this, arguments).then((nodes) => {
                    const count = nodes.length;
                    node.after(...nodes);
                    node.remove();
        
                    // Return DOM mutation count
                    return count;
                }) :
                render.apply(this, arguments) ;
        });
    },

    'default': (renderers, vars, node, Literal) => {
        // Children first
        compileChildren(renderers, vars, node, Literal);

        // We must wait until custom elements are upgraded before we may 
        // interact with their non-standard properties and attributes
        if (isCustomElement(node)) {
            const i = renderers.length;
            window.customElements.whenDefined(name).then(() => {
                compileTag(renderers, vars, node, Literal);
                compileType(renderers, vars, node, Literal);
            });
        }
        else {
            compileTag(renderers, vars, node, Literal);
            compileType(renderers, vars, node, Literal);
        }
    }
});


/** 
compileNode()
**/

const compileNode = overload((renderers, vars, node) => toType(node), {
    'comment': noop,

    'element': (renderers, vars, node, Literal) => {
        compileElement(renderers, vars, node, Literal);
        return renderers;
    },

    'fragment': (renderers, vars, node, Literal) => {
        compileChildren(renderers, vars, node, Literal);
        return renderers;
    },

    'text': (renderers, vars, node) => {
        compileText(renderers, vars, node);
        return renderers;
    },

    'doctype': noop,

    'document': (renderers, vars, node, Literal) => {
        compileChildren(renderers, vars, node, Literal);
        return renderers;
    },

    'default': (renderers, vars, node) => {
        throw new Error('Node not compileable');
    }
});

export default compileNode;

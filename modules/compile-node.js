
import noop       from '../../fn/modules/noop.js';
import overload   from '../../fn/modules/overload.js';
import { toType, isNode } from '../../dom/modules/node.js';

import library from './lib.js';
import { compileStringRender, compileValueRender, compileValues } from './compile.js';
import log     from './log.js';
import decode  from './decode.js';

import { isCustomElement, setText, setBooleanProperty, setClass, setPropertyChecked, setPropertyValue } from './dom.js';

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
Renderer
**/

function Renderer(render, path, node, name, update) {
    this.name = name;
    this.node = node;
    this.path = path;    
    this.render = function() {
        // this.node may change in the future
        return render(...params)
        .then((value) => update(this.node, name, value));
    };
}


/** 
compileAttributes(renderers, vars, path, nodeames)
**/

function renderAttribute(node, name, value) {
    if (value === node.getAttribute(name)) { return 0; }
    // Mutate DOM
    node.setAttribute(name, value);
    // Return number of mutations
    return 1;
}

function compileAttr(renderers, vars, path, node, name) {
    const string = node.getAttribute(name);
    if (!string || !rliteral.test(string)) { return; }

    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new Renderer(render, path, node, name, renderAttribute));
    /*
    renderers.push((...params) => 
        render(...params).then((value) => {
            if (value === node.getAttribute(name)) { return 0; }
            // Mutate DOM
            node.setAttribute(name, value);
            // Return number of mutations
            return 1;
        })
    );
    */
}

function compileBoolean(renderers, vars, path, node, name) {
    const string = node.getAttribute(name);
    if (!string || !rliteral.test(string)) { return; }

    node.removeAttribute(name);
    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new Renderer(render, path, node, name, setBooleanProperty));

    /*
    renderers.push((...params) => 
        render(...params).then((value) => setBooleanProperty(node, name, value))
    );
    */
}

function compileClass(renderers, vars, path, node, name) {
    const string = node.getAttribute('class');
    if (!string || !rliteral.test(string)) { return; }

    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new Renderer(render, path, node, name, setClass));
    /*
    renderers.push((...params) => 
        render(...params)
        .then((value) => {
            console.log('Todo: render class');
        })
    );
    */
}

function setValue(node, name, value) {
    return setPropertyValue(node, value);
}

function compileValue(renderers, vars, path, node) {
    const string = node.getAttribute('value');
    if (!string || !rliteral.test(string)) { return; }

    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new Renderer(render, path, node, 'value', setValue));

    /*
    renderers.push((...params) => 
        render(...params)
        .then((value) => setPropertyValue(node, value))
    );
    */
}


function compileValueString(renderers, vars, path, node) {
    const string = node.getAttribute('value');
    if (!string || !rliteral.test(string)) { return; }

    const render = compileStringRender(library, vars, string, 'arguments[1]');
    renderers.push(new Renderer(render, path, node, 'value', setValue));

    /*
    renderers.push((...params) => 
        render(...params)
        .then((value) => setPropertyValue(node, value))
    );
    */
}

function setChecked(node, name, value) {
    return setPropertyChecked(node, value);
}

function compileChecked(renderers, vars, path, node) {
    const string = node.getAttribute('value');
    if (!string || !rliteral.test(string)) { return; }

    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new Renderer(render, path, node, 'value', setChecked));

    /*
    renderers.push((...params) => 
        render(...params)
        .then((value) => setPropertyChecked(node, value))
    );
    */
}

const compileAttribute = overload((renderers, vars, path, node, name) => name, {
    'checked': compileChecked,

    'class': function compileClass(renderers, vars, path, node) {
        const string = node.getAttribute('class');
        if (!string || !rliteral.test(string)) { return; }    
        const render = compileValueRender(library, vars, string, 'arguments[1]');
        /*
        renderers.push((...params) => 
            render(...params)
            .then((value) => {
                console.log('Todo: render class');
            })
        );
        */
    },

    'datetime': function compileDatetime(renderers, vars, path, node) {
        console.log('Todo: compile datetime');
    },

    'disabled': compileBoolean,
    'hidden':   compileBoolean,
    'required': compileBoolean,

    'value': overload((renderers, vars, path, node, name) => ('' + node.type), {
        //'checkbox':  compileValueChecked,
        //'date':    compileValueDate,
        //'number':    compileValueNumber,
        //'range':     compileValueNumber,
        //'select-multiple': compileValueArray,
        'text':      compileValueString,
        'search':    compileValueString,
        'default':   compileValue,
        'undefined': (renderers, vars, path, node) => {
            compileAttr(renderers, vars, path, node, 'value');
        }
    }),

    'default':  compileAttr
});

function compileAttributes(renderers, vars, node, path, names) {
    if (!names) { return; }
    var n = -1;
    while (names[++n]) {
        compileAttribute(renderers, vars, (path ? path + '.' + names[n]), node, names[n]);
    }
}


/**
compileElement()
**/

function setText(node, name, nodes) {
    console.log('renderValues:', nodes);

    var n = -1;
    var string = '';
    while (++n < nodes.length && !(isNode(nodes[n]) || isNode(nodes[n][0]))) {
        string += nodes[n];
    }

    // Change text in text node to just initial string
    node.nodeValue = string;

    // Get the rest of the things, owt else goes after
    const rest = Array.prototype.slice.call(nodes, n);
    rest.length && node.after.apply(node, rest);
    return 1 + rest.length;
}

function compileText(renderers, vars, path, node) {
    const string = node.nodeValue;

    if (string && rliteral.test(string)) {
        const render = compileValues(library, vars, decode(string), 'arguments[1]');
        renderers.push(new Renderer(render, path, node, 'nodeValue', setText));
        /*
        renderers.push((...params) =>
            render(...params).then((nodes) => {

                console.log('renderValues:', nodes);

                var n = -1;
                var string = '';
                while (++n < nodes.length && !(isNode(nodes[n]) || isNode(nodes[n][0]))) {
                    string += nodes[n];
                }

                // Change text in text node to just initial string
                node.nodeValue = string;

                // Get the rest of the things, owt else goes after
                const rest = Array.prototype.slice.call(nodes, n);
                rest.length && node.after.apply(node, rest);
                return 1 + rest.length;
            }
        ));
        */
    }
}

function compileChildren(renderers, vars, path, node) {
    const children = node.childNodes;

    if (children) {
        let n = -1;
        while(children[++n]) {
            compileNode(renderers, vars, (path ? path + '.' + n : path + n), children[n]);
        }
    }
}

function compileTag(renderers, vars, path, node) {
    // Compile global attributes    
    compileAttributes(renderers, vars, path, node, config.elements['*']);

    // Compile element attributes
    const tag   = node.tagName.toLowerCase();
    const names = config.elements[tag || 'default'];
    compileAttributes(renderers, vars, path, node, names);
}

function compileType(renderers, vars, path, node) {
    // Compile element type attributes
    const type  = node.type;
    if (!type) { return; }
    const names = config.types[type] || config.types['default'];
    compileAttributes(renderers, vars, path, node, names);
}

const compileElement = overload((renderers, vars, path, node) => node.tagName.toLowerCase(), {
    // Ignore SVG <defs>, which for our purposes we consider as equivalent to 
    // the inert content of HTML <template>
    'defs': noop,

    'default': (renderers, vars, path, node) => {
        // Children first
        compileChildren(renderers, vars, path, node);

        // We must wait until custom elements are upgraded before we may 
        // interact with their non-standard properties and attributes
        if (isCustomElement(node)) {
            //const i = renderers.length;
            window.customElements.whenDefined(name).then(() => {
                compileTag(renderers, vars, path, node);
                compileType(renderers, vars, path, node);
            });
        }
        else {
            compileTag(renderers, vars, path, node);
            compileType(renderers, vars, path, node);
        }
    }
});


/** 
compileNode()
**/

const compileNode = overload((renderers, vars, path, node) => toType(node), {
    'comment': noop,

    'element': (renderers, vars, path, node) => {
        compileElement(renderers, vars, path, node);
        return renderers;
    },

    'fragment': (renderers, vars, path, node) => {
        compileChildren(renderers, vars, path, node);
        return renderers;
    },

    'text': (renderers, vars, path, node) => {
        compileText(renderers, vars, path, node);
        return renderers;
    },

    'doctype': noop,

    'document': (renderers, vars, path, node) => {
        compileChildren(renderers, vars, path, node);
        return renderers;
    },

    'default': (renderers, vars, node) => {
        throw new Error('Node not compileable');
    }
});

export default compileNode;

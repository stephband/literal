
import noop       from '../../fn/modules/noop.js';
import overload   from '../../fn/modules/overload.js';
import { toType, isNode } from '../../dom/modules/node.js';

import library  from './library.js';
import { compileStringRender, compileValueRender, compileValues } from './compile.js';
import Renderer from './renderer.js';
import log      from './log.js';
import decode   from './decode.js';

import { isCustomElement, setBooleanProperty, setAttribute, setClass, setPropertyChecked, setPropertyValue } from './dom.js';

const DEBUG = window.DEBUG === true || window.DEBUG && window.DEBUG.includes('literal');

const config = {
    elements: {
        // Global
        '*':        ['id', 'title', 'style', 'class', 'hidden', 'html'],

        // HTML
        'a':        ['href'],
        'audio':    ['src'],
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
        'output':   ['name', 'for', 'value'],
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
compileAttributes(renderers, vars, path, nodeames)
**/

function compileAttr(renderers, vars, path, node, name) {
    const string = node.getAttribute(name);
    if (!string || !rliteral.test(string)) { return; }
    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new Renderer(render, path, node, name, setAttribute));
}

function compileBoolean(renderers, vars, path, node, name) {
    const string = node.getAttribute(name);
    if (!string || !rliteral.test(string)) { return; }
    node.removeAttribute(name);
    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new Renderer(render, path, node, name, setBooleanProperty));
}

function compileClass(renderers, vars, path, node, name) {
    const string = node.getAttribute('class');
    if (!string || !rliteral.test(string)) { return; }
    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new Renderer(render, path, node, name, setClass));
}

function setValue(node, name, value) {
    return setPropertyValue(node, value);
}

function compileValue(renderers, vars, path, node) {
    const string = node.getAttribute('value');
    if (!string || !rliteral.test(string)) { return; }
    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new Renderer(render, path, node, 'value', setValue));
}

function compileValueString(renderers, vars, path, node) {
    const string = node.getAttribute('value');
    if (!string || !rliteral.test(string)) { return; }
    const render = compileStringRender(library, vars, string, 'arguments[1]');
    renderers.push(new Renderer(render, path, node, 'value', setValue));
}

function setChecked(node, name, value) {
    return setPropertyChecked(node, value);
}

function compileChecked(renderers, vars, path, node) {
    const string = node.getAttribute('value');
    if (!string || !rliteral.test(string)) { return; }
    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new Renderer(render, path, node, 'value', setChecked));
}

function setChildren(node, name, nodes) {
    node.append.apply(node, nodes);
    return nodes.length;
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

    // Special workaround attribute used in cases where ${} cannot be added
    // directly to the HTML content, such as in <tbody> or <tr>
    'html': function compileClass(renderers, vars, path, node) {
        const string = node.getAttribute('html');
        if (!string) { return; }
        node.removeAttribute('html');
        const render = compileValues(library, vars, decode(string), 'arguments[1]');
        renderers.push(new Renderer(render, path, node, 'children', setChildren));
    },

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

function compileAttributes(renderers, vars, path, node, names) {
    if (!names) { return; }
    var n = -1;
    while (names[++n]) {
        compileAttribute(renderers, vars, (path ? path + '.' + names[n] : names[n]), node, names[n]);
    }
}


/**
compileElement()
**/

function setText(node, name, nodes) {
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
    // Ignore SVG <defs>, which for our purposes we consider as inert like 
    // HTML's <template>
    'defs': noop,

    'default': (renderers, vars, path, node) => {
        // Children first
        compileChildren(renderers, vars, path, node);

        // We must wait until custom elements are upgraded before we may 
        // interact with their non-standard properties and attributes
        const tag = node.getAttribute('is') || node.tagName.toLowerCase();
        if (/-/.test(tag)) {
            window.customElements.whenDefined(node.tagName).then(() => {
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

    'default': () => {
        throw new Error('Node not compileable');
    }
});

export default compileNode;

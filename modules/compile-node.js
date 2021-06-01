
import noop       from '../../fn/modules/noop.js';
import overload   from '../../fn/modules/overload.js';
import { toType } from '../../dom/modules/node.js';

import library  from './library.js';
import include  from './include.js';
import { compileStringRender, compileValueRender, compileValues } from './compile.js';
import compileContent from './compile-content.js';
import { AttributeRenderer, BooleanRenderer, CheckedRenderer, TokensRenderer, ValueRenderer } from './renderer-attribute.js';
import { ContentRenderer } from './renderer-content.js';
import log      from './log.js';
import decode   from './decode.js';

const DEBUG = window.DEBUG === true || window.DEBUG && window.DEBUG.includes('literal');

const assign = Object.assign;

const config = {
    /*elements: {
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
    },*/

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

function compileAttr(renderers, vars, path, node, attribute) {
    const string = attribute.value;
    if (!string || !rliteral.test(string)) { return; }
    const name = attribute.localName;
    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new AttributeRenderer(render, path, node, name));
}

function compileBoolean(renderers, vars, path, node, attribute) {
    const string = attribute.value;
    if (!string || !rliteral.test(string)) { return; }
    const name = attribute.localName;
    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new BooleanRenderer(render, path, node, name));
}

function compileTokens(renderers, vars, path, node, attribute) {
    const string = attribute.value;
    if (!string || !rliteral.test(string)) { return; }
    const name = attribute.localName;
    const render = compileValues(library, vars, string, 'arguments[1]');
    renderers.push(new TokensRenderer(render, path, node, name));
}

function compileValue(renderers, vars, path, node, attribute) {
    const string = attribute.value;
    if (!string || !rliteral.test(string)) { return; }
    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new ValueRenderer(render, path, node));
}

function compileValueString(renderers, vars, path, node, attribute) {
    const string = attribute.value;
    if (!string || !rliteral.test(string)) { return; }
    const render = compileStringRender(library, vars, string, 'arguments[1]');
    renderers.push(new ValueRenderer(render, path, node));
}

function compileChecked(renderers, vars, path, node, attribute) {
    const string = attribute.value;
    if (!string || !rliteral.test(string)) { return; }
    const render = compileValueRender(library, vars, string, 'arguments[1]');
    renderers.push(new CheckedRenderer(render, path, node));
}

const compileAttribute = overload((renderers, vars, path, node, attribute) => attribute.localName, {
    'checked':  compileChecked,
    'class':    compileTokens,

    'datetime': function compileDatetime(renderers, vars, path, node, attribute) {
        console.log('Todo: compile datetime');
    },

    'disabled': compileBoolean,
    'hidden':   compileBoolean,

    // Special workaround attribute used in cases where ${} cannot be added
    // directly to the HTML content, such as in <tbody> or <tr>
    'inner-content': function compileContent(renderers, vars, path, node, attribute) {
        const string = attribute.value;
        if (!string || !rliteral.test(string)) { return; }
        node.removeAttribute(attribute.localName);
        const render = compileContent(contentLibrary, vars, decode(string), 'arguments[1]');
        renderers.push(new ContentRenderer(render, path, node));
    },

    'required': compileBoolean,

    'value': overload((renderers, vars, path, node, attribute) => ('' + node.type), {
        //'checkbox':  compileValueChecked,
        //'date':      compileValueDate,
        //'number':    compileValueNumber,
        //'range':     compileValueNumber,
        //'select-multiple': compileValueArray,
        'text':      compileValueString,
        'search':    compileValueString,
        'default':   compileValue,
        'undefined': compileAttr
    }),

    'default':  compileAttr
});

function compileAttributes(renderers, vars, path, node) {
    const attributes = node.attributes;
    var n = -1, attribute;
    while (attribute = attributes[++n]) {
        compileAttribute(renderers, vars, path, node, attribute);
    }
}


/**
compileElement()
**/

function compileChildren(renderers, vars, path, node) {
    const children = node.childNodes;

    if (children) {
        let n = -1;
        while(children[++n]) {
            compileNode(renderers, vars, (path ? path + '.' + n : path + n), children[n]);
        }
    }
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
        // Todo:
        // Hang on... is this still true given that the renderer.set negociates
        // the way an attribute is rendered??
        const tag = node.getAttribute('is') || node.tagName.toLowerCase();
        if (/-/.test(tag)) {
            window.customElements.whenDefined(node.tagName).then(() => {
                compileAttributes(renderers, vars, path, node);
                compileType(renderers, vars, path, node);
            });
        }
        else {
            compileAttributes(renderers, vars, path, node);
            compileType(renderers, vars, path, node);
        }
    }
});


/** 
compileNode()
**/

const contentLibrary = assign({}, library, {
    include: include
});

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
        const string = node.nodeValue;

        if (string && rliteral.test(string)) {
            const render = compileContent(contentLibrary, vars, decode(string), 'arguments[1]');
            renderers.push(new ContentRenderer(render, path, node));
        }

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

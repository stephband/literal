
import noop       from '../../fn/modules/noop.js';
import overload   from '../../fn/modules/overload.js';
import { toType } from '../../dom/modules/node.js';

import AttributeRenderer from './renderers/attribute-renderer.js';
import BooleanRenderer   from './renderers/boolean-renderer.js';
import CheckedRenderer   from './renderers/checked-renderer.js';
import ContentRenderer   from './renderers/content-renderer.js';
import TokensRenderer    from './renderers/tokens-renderer.js';
import ValueRenderer, { StringValueRenderer } from './renderers/value-renderer.js';

import log      from './log.js';
import decode   from './decode.js';

const DEBUG = window.DEBUG === true || window.DEBUG && window.DEBUG.includes('literal');

const A = Array.prototype;

const config = {
    /*
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
    */
};

const rliteral = /\$\{/;


/** 
compileAttributes(renderers, options, nodeames)
**/

function compileAttr(renderers, options, node, attribute) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    const name = attribute.localName;
    options.source = source;
    options.name   = name;
    renderers.push(new AttributeRenderer(node, options));
}

function compileBoolean(renderers, options, node, attribute) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    const name = attribute.localName;
    options.source = source;
    options.name   = name;
    renderers.push(new BooleanRenderer(node, options));
}

function compileTokens(renderers, options, node, attribute) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    const name = attribute.localName;
    options.source = source;
    options.name   = name;
    renderers.push(new TokensRenderer(node, options));
}

function compileValue(renderers, options, node, attribute) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    options.source = source;
    options.name   = 'value';
    renderers.push(new ValueRenderer(node, options));
}

function compileValueString(renderers, options, node, attribute) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    options.source = source;
    options.name   = 'value';
    renderers.push(new StringValueRenderer(node, options));
}

function compileChecked(renderers, options, node, attribute) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    options.source = source;
    options.name   = 'checked';
    renderers.push(new CheckedRenderer(node, options));
}

const compileAttribute = overload((renderers, options, node, attribute) => attribute.localName, {
    'checked':  compileChecked,
    'class':    compileTokens,

    'datetime': function compileDatetime(renderers, options, node, attribute) {
        console.log('Todo: compile datetime');
    },

    'disabled': compileBoolean,
    'hidden':   compileBoolean,

    // Special workaround attribute used in cases where ${} cannot be added
    // directly to the HTML content, such as in <tbody> or <tr>
    'inner-content': function(renderers, options, node, attribute) {
        const string = attribute.value;
        if (!string || !rliteral.test(string)) { return; }
        node.removeAttribute(attribute.localName);
        options.source = decode(string);
        options.name   = 'innerHTML';
        renderers.push(new ContentRenderer(node, options));
    },

    'required': compileBoolean,

    'value': overload((renderers, options, node, attribute) => ('' + node.type), {
        //'checkbox':  compileValueChecked,
        //'date':      compileValueDate,
        //'number':    compileValueNumber,
        //'range':     compileValueNumber,
        //'select-multiple': compileValueArray,
        'text':       compileValueString,
        'search':     compileValueString,
        'select-one': compileValueString,
        'default':    compileValue,
        'undefined':  compileAttr
    }),

    'default':  compileAttr
});

function compileAttributes(renderers, options, node) {
    // Attributes may be removed during parsing so copy the list before looping
    const attributes = A.slice.apply(node.attributes);
    var n = -1, attribute;
    // Todo: order attributes so that min, max, value come last?
    while (attribute = attributes[++n]) {
        compileAttribute(renderers, options, node, attribute);
    }
}


/**
compileElement()
**/

function compileChildren(renderers, options, node) {
    const children = node.childNodes;

    if (children) {
        let n = -1;
        while(children[++n]) {
            // Todo: can we get away with overwriting path on the same options object here? 
            // Instead of creating a new object?
            const opts = Object.assign({}, options, {
                source: '',
                name: null,
                path: (options.path ? options.path + '.' + n : '' + n) 
            });

            compileNode(renderers, opts, children[n], node);
        }
    }

    return renderers;
}
/*
function compileType(renderers, options, node) {
    // Compile element type attributes
    const type = node.type;
    if (!type) { return; }
    //const names = config.types[type] || config.types['default'];
    compileAttributes(renderers, options, node);
}
*/
const compileElement = overload((renderers, options, node) => node.tagName.toLowerCase(), {
    // Ignore SVG <defs>, which for our purposes we consider as inert like 
    // HTML's <template>
    'defs': noop,

    'default': (renderers, options, node) => {
        // Children first
        compileChildren(renderers, options, node);

        // We must wait until custom elements are upgraded before we may 
        // interact with their non-standard properties and attributes
        // Todo:
        // Hang on... is this still true given that the renderer.set negociates
        // the way an attribute is rendered??
        /*const tag = node.getAttribute('is') || node.tagName.toLowerCase();
        if (/-/.test(tag)) {
            window.customElements.whenDefined(node.tagName).then(() => {
                compileAttributes(renderers, options, node);
                compileType(renderers, options, node);
            });
        }
        else {*/
            compileAttributes(renderers, options, node);
            //compileType(renderers, options, node);
        /*}*/
        
        return renderers;
    }
});


/** 
compileNode()
**/

const compileNode = overload((renderers, options, node) => toType(node), {
    'comment': noop,

    'element': compileElement,

    'fragment': compileChildren,

    'text': (renderers, options, node, element) => {
        const string = node.nodeValue;

        if (string && rliteral.test(string)) {
            options.source = decode(string);
            options.name   = null;
            renderers.push(new ContentRenderer(node, options, element));
        }

        return renderers;
    },

    'doctype': noop,

    'document': (renderers, options, node) => {
        compileChildren(renderers, options, node);
        return renderers;
    },

    'default': () => {
        throw new Error('Node not compileable');
    }
});

export default compileNode;

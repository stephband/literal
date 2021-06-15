
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
compileAttributes(renderers, vars, path, nodeames)
**/

function compileAttr(renderers, consts, path, node, attribute, context) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    const name = attribute.localName;
    renderers.push(new AttributeRenderer(node, context, { consts, source, path, name }));
}

function compileBoolean(renderers, consts, path, node, attribute, context) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    const name = attribute.localName;
    renderers.push(new BooleanRenderer(node, context, { consts, source, path, name }));
}

function compileTokens(renderers, consts, path, node, attribute, context) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    const name = attribute.localName;
    renderers.push(new TokensRenderer(node, context, { consts, source, path, name }));
}

function compileValue(renderers, consts, path, node, attribute, context) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    renderers.push(new ValueRenderer(node, context, { consts, source, path }));
}

function compileValueString(renderers, consts, path, node, attribute, context) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    renderers.push(new StringValueRenderer(node, context, { consts, source, path }));
}

function compileChecked(renderers, consts, path, node, attribute, context) {
    const source = attribute.value;
    if (!source || !rliteral.test(source)) { return; }
    renderers.push(new CheckedRenderer(node, context, { consts, source, path }));
}

const compileAttribute = overload((renderers, vars, path, node, attribute) => attribute.localName, {
    'checked':  compileChecked,
    'class':    compileTokens,

    'datetime': function compileDatetime(renderers, vars, path, node, attribute, context) {
        console.log('Todo: compile datetime');
    },

    'disabled': compileBoolean,
    'hidden':   compileBoolean,

    // Special workaround attribute used in cases where ${} cannot be added
    // directly to the HTML content, such as in <tbody> or <tr>
    'inner-content': function(renderers, consts, path, node, attribute, context) {
        const string = attribute.value;
        if (!string || !rliteral.test(string)) { return; }
        node.removeAttribute(attribute.localName);
        renderers.push(new ContentRenderer(node, context, { consts, source: decode(string), path }));
    },

    'required': compileBoolean,

    'value': overload((renderers, vars, path, node, attribute, context) => ('' + node.type), {
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

function compileAttributes(renderers, vars, path, node, context) {
    const attributes = node.attributes;
    var n = -1, attribute;
    // Todo: order attributes so that min, max, value come last?
    while (attribute = attributes[++n]) {
        compileAttribute(renderers, vars, path, node, attribute, context);
    }
}


/**
compileElement()
**/

function compileChildren(renderers, vars, path, node, context) {
    const children = node.childNodes;

    if (children) {
        let n = -1;
        while(children[++n]) {
            compileNode(renderers, vars, (path ? path + '.' + n : path + n), children[n], context);
        }
    }
}
/*
function compileType(renderers, vars, path, node, context) {
    // Compile element type attributes
    const type = node.type;
    if (!type) { return; }
    //const names = config.types[type] || config.types['default'];
    compileAttributes(renderers, vars, path, node, context);
}
*/
const compileElement = overload((renderers, vars, path, node) => node.tagName.toLowerCase(), {
    // Ignore SVG <defs>, which for our purposes we consider as inert like 
    // HTML's <template>
    'defs': noop,

    'default': (renderers, vars, path, node, context) => {
        // Children first
        compileChildren(renderers, vars, path, node, context);

        // We must wait until custom elements are upgraded before we may 
        // interact with their non-standard properties and attributes
        // Todo:
        // Hang on... is this still true given that the renderer.set negociates
        // the way an attribute is rendered??
        /*const tag = node.getAttribute('is') || node.tagName.toLowerCase();
        if (/-/.test(tag)) {
            window.customElements.whenDefined(node.tagName).then(() => {
                compileAttributes(renderers, vars, path, node);
                compileType(renderers, vars, path, node);
            });
        }
        else {*/
            compileAttributes(renderers, vars, path, node, context);
            //compileType(renderers, vars, path, node, context);
        /*}*/
    }
});


/** 
compileNode()
**/

const compileNode = overload((renderers, vars, path, node) => toType(node), {
    'comment': noop,

    'element': (renderers, vars, path, node, context) => {
        compileElement(renderers, vars, path, node, context);
        return renderers;
    },

    'fragment': (renderers, vars, path, node, context) => {
        compileChildren(renderers, vars, path, node, context);
        return renderers;
    },

    'text': (renderers, consts, path, node, context) => {
        const string = node.nodeValue;

        if (string && rliteral.test(string)) {
            renderers.push(new ContentRenderer(node, context, { consts, source: decode(string), path }));
        }

        return renderers;
    },

    'doctype': noop,

    'document': (renderers, vars, path, node, context) => {
        compileChildren(renderers, vars, path, node, context);
        return renderers;
    },

    'default': () => {
        throw new Error('Node not compileable');
    }
});

export default compileNode;

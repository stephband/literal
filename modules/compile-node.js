
import noop     from '../../fn/modules/noop.js';
import overload from '../../fn/modules/overload.js';
import toType   from '../../dom/modules/to-type.js';

import AttributeRenderer from './renderers/attribute-renderer.js';
import BooleanRenderer   from './renderers/boolean-renderer.js';
import CheckedRenderer   from './renderers/checked-renderer.js';
import ContentRenderer   from './renderers/content-renderer.js';
import TokensRenderer    from './renderers/tokens-renderer.js';
import ValueRenderer, { StringValueRenderer } from './renderers/value-renderer.js';

import decode   from './decode.js';

const A = Array.prototype;
const rliteral = /\$\{/;


/** 
compileAttributes(renderers, options, nodeames)
**/

function addAttributeRenderer(renderers, Renderer, node, source, name, options) {
    if (!source || !rliteral.test(source)) { return; }
    options.source = source;
    options.name   = name;
    renderers.push(new Renderer(node, options));
}

function compileAttr(renderers, options, node, attribute) {
    addAttributeRenderer(renderers, AttributeRenderer, node, attribute.value, attribute.localName, options);
}

function compileBoolean(renderers, options, node, attribute) {
    addAttributeRenderer(renderers, BooleanRenderer, node, attribute.value, attribute.localName, options);
}

function compileTokens(renderers, options, node, attribute) {
    addAttributeRenderer(renderers, TokensRenderer, node, attribute.value, attribute.localName, options);
}

function compileValue(renderers, options, node, attribute) {
    addAttributeRenderer(renderers, ValueRenderer, node, attribute.value, 'value', options);
}

function compileValueString(renderers, options, node, attribute) {
    addAttributeRenderer(renderers, StringValueRenderer, node, attribute.value, 'value', options);
}


const compileAttribute = overload((renderers, options, node, attribute) => attribute.localName, {
    'checked':  function compileChecked(renderers, options, node, attribute) {
        addAttributeRenderer(renderers, CheckedRenderer, node, attribute.value, 'checked', options);
    },

    'class': compileTokens,

    'datetime': function compileDatetime(renderers, options, node, attribute) {
        if (window.DEBUG) { console.log('Todo: compile datetime attribute'); }
    },

    'disabled': compileBoolean,
    'hidden': compileBoolean,

    // Special workaround attribute used in cases where ${} cannot be added
    // directly to the HTML content, such as in <tbody> or <tr>
    'inner-content': function(renderers, options, node, attribute) {
        const string = attribute.value;
        if (!string || !rliteral.test(string)) { return; }
        node.removeAttribute(attribute.localName);
        options.source = decode(string);
        options.name   = 'innerHTML';
        renderers.push(new ContentRenderer(node, options, parent));
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

    'default': compileAttr
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

function compileChildren(renderers, options, node, parent) {
    const children = node.childNodes;

    if (children) {
        const path = options.path;
        let n = -1;

        while(children[++n]) {
            options.path = path ? path + '.' + n : '' + n;
            compileNode(renderers, options, children[n], parent);
        }

        // Put path back to what it was or subsequent renderers will get an
        // erroneous path
        options.path = path;
    }

    return renderers;
}

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

    'text': (renderers, options, node, parent) => {
        const string = node.nodeValue;

        if (string && rliteral.test(string)) {
            options.source = decode(string);
            options.name   = null;
            renderers.push(new ContentRenderer(node, options, parent));
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

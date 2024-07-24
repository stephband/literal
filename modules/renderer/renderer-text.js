
/**
TextRenderer(source, node, path, index, message)
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert
that DOM after the text node.
**/

import Signal           from '../../../fn/modules/signal.js';
import Data             from '../../../fn/modules/data.js';
import { isCommentNode, isElementNode, isFragmentNode, isTextNode } from '../../../dom/modules/node.js';
import include          from '../scope/include.js';
import deleteRange      from '../dom/delete-range.js';
import Template         from '../template.js';
import print, { printError } from '../scope/print.js';
import toText           from './to-text.js';
import Renderer, { stats } from './renderer.js';


const assign = Object.assign;


function stop(node) {
    node && typeof node === 'object' && node.stop && node.stop();
}

function setNodeValue(node, value) {
    const nodeValue = node.nodeValue;

    // textNode.nodeValue = null actually results in textNode.nodeValue = ''
    if (nodeValue) {
        if (nodeValue !== value) {
            node.nodeValue = value;
            if (window.DEBUG) ++stats.text;
        }
    }
    else {
        if (value) {
            node.nodeValue = value;
            if (window.DEBUG) ++stats.text;
        }
    }
}

function toContent(object) {
    return object.content ?
        toContent(object.content) :
        object ;
}

function objectToContents(state, object, i) {
    // Object may be a primitive, a DOM node or fragment, a LiteralTemplate or
    // an array of any of these.
    let { string, contents } = state;

    // If object is not a node or renderer, append to string. Array.isArray()
    // does return true for a proxy of an array.
    if (!(object instanceof Template) && !(object instanceof Node) && !Array.isArray(object)) {
        state.string += toText(object);
        return i;
    }

    // If there is a string to splice in
    if (string) {
        // And content is a text node, but not the last text node, update it
        if (++i < contents.length - 1 && isTextNode(contents[i])) {
            setNodeValue(contents[i], string);
        }
        // Otherwise create new text node and splice it into contents
        // and the DOM
        else {
            const node = document.createTextNode(string);
            contents[i].before(node);
            if (window.DEBUG) ++stats.add;
            contents.splice(i, 0, node);
        }

        state.string = '';
    }

    // It is possible that the template has returned the same object
    // again, in which case we do nothing. Unlikely, but possible.
    if (object === contents[++i]) return i;
    --i;

    // Object is an array, recurse over its values
    if (Array.isArray(object)) {
        //state.i = i;
        let n = -1;
        while(++n < object.length) i = objectToContents(state, object[n], i);
        return i;
    }

    // Object is a freshly rendered Literal Template
    if (object instanceof Template) {
        contents[++i].before(toContent(object));
        if (window.DEBUG) ++stats.add;
        contents.splice(i, 0, object);
        //state.i = i;
        return i;
    }

    // Object is a fragment
    if (isFragmentNode(object)) {
        // TODO Splice fragment content in... represent in contents
        // with a new object?
        console.log('TODO');
        //state.i = i;
        return i;
    }

    // Object is a DOM node
    if (isTextNode(object) || isElementNode(object) || isCommentNode(object)) {
        // Splice node into contents and the DOM
        contents[++i].before(object);
        if (window.DEBUG) ++stats.add;
        contents.splice(i, 0, object);
        //state.i = i;
        return i;
    }

    return i;
}


/**
TextRenderer()
Renders a text node. Text node literals may evaluate to DOM nodes or fragments,
template renderers, or strings.
**/

export default class TextRenderer extends Renderer {
    static parameterNames = ['data', 'DATA', 'element', 'host', 'shadow', 'include', 'print'];

    constructor(signal, literal, parameters, element, node, debug) {
        if (window.DEBUG && !isTextNode(node)) {
            throw new TypeError('TextRenderer() node not a text node');
        }

        // Parameters added to text renderer
        const params = assign({}, parameters, {
            include: (...params) => this.include(...params),
            print:   (...args) => print(this, ...args)
        });

        super(signal, literal, params, element, node, debug);

        // Contents may contain Nodes and LiteralTemplates, but the last item
        // in contents will always be the original text node
        this.contents = [node];
        this.string   = '';

        // A synchronous evaluation while data signal value is undefined binds
        // this renderer to changes to that signal. If signal value is a `data`
        // object evaluation renders the renderer immediately.
        Signal.evaluate(this, this.evaluate);
    }

    get firstNode() {
        // The first item in contents may be a LiteralTemplate
        return this.contents[0].firstNode ?
            this.contents[0].firstNode :
            this.contents[0] ;
    }

    get lastNode() {
        // The last item in contents is always the original text node
        return this.contents[this.contents.length - 1];
    }

    include(url) {
        return arguments.length === 1 ?
            // Partially applied
            (data) => this.include(url, data) :
            // Immediate include
            include(url, arguments[1], this.element, this.parameters) ;
    }

    evaluate() {
        if (window.DEBUG) {
            try {
                return super.evaluate();
            }
            catch(error) {
                // Error object, renderer, DATA
                const elem = printError(this, error);
                this.render(['',''], elem);
                //throw new Error('Literal', { cause: error });
                return;
            }
        }

        return super.evaluate();
    }

    render(strings) {
        // Last is the original text node
        const contents = this.contents;
        const last     = contents[contents.length - 1];

        // Use `this` as an accumulator for .string. It's an internal object
        // anyway, so this should not leak, but I admit doing this is a bit naff.
        // It does avoid creating any more objects though.
        this.string = '';

        // Loop over strings, zip objects into string
        let n = -1;
        let i = -1;
        while(++n < strings.length - 1) {
            // Add string to next output-to-text-node string
            this.string += strings[n];
            i = objectToContents(this, arguments[n + 1], i);
        }

        // Set the last string on the last text node
        setNodeValue(last, this.string + strings[n]);

        // Remove and stop unused contents up to but not including the last node
        if (contents[++i] !== last) {
            const mid = contents[i].firstNode || contents[i];
            deleteRange(mid, last);
            if (window.DEBUG) ++stats.remove;
            contents.splice(i, contents.length - i - 1).forEach(stop);
        }
    }

    stop() {
        this.contents.forEach(stop);
        this.contents.length = 0;
        return super.stop.apply(this);
    }
}

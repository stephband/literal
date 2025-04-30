
/**
TextRenderer(source, node, path, index, message)
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert
that DOM after the text node.
**/

import Signal           from 'fn/signal.js';
import Data             from 'fn/data.js';
import isComment        from 'dom/is-comment.js';
import isElement        from 'dom/is-element.js';
import isFragment       from 'dom/is-fragment.js';
import isTextNode       from 'dom/is-text-node.js';

import include          from '../include.js';
import deleteRange      from '../dom/delete-range.js';
import Literal          from '../template.js';
import print, { printError } from '../print.js';
import toText           from './to-text.js';
import Renderer, { stats } from './renderer.js';


const assign = Object.assign;


function stop(node) {
    node && typeof node === 'object' && node.stop && node.stop();
}

function notInDOM(node) {
if (node.parentNode === null) {
    debugger
    console.log('NODE NOT IN DOM', node);
}
    return node.parentNode === null;
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

/*
function toContent(object) {
    return object.content ?
        toContent(object.content) :
        object ;
}
*/

function objectToContents(state, object, i) {
    // Object may be a primitive, a DOM node or fragment, a LiteralTemplate or
    // an array of any of these.
    let { string, contents } = state;

    // If object is not a node or renderer, append to string. Array.isArray()
    // does return true for a proxy of an array.
    if (!(object instanceof Literal) && !(object instanceof Node) && !Array.isArray(object)) {
        state.string += toText(object);
        return i;
    }

    // If there is a string to splice in we must do that before dealing with
    // object
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
        // Reset string accumulator
        state.string = '';
    }

    // It is possible that the template has returned the same object at the same
    // index again, in which case we do nothing. Not hugely likely, but possible.
    if (object === contents[++i]) return i;
    --i;

    // Object is an array, recurse over its values
    if (Array.isArray(object)) {
        let n = -1;
        while(++n < object.length) i = objectToContents(state, object[n], i);
        return i;
    }

    // Object is a Literal Template
    if (object instanceof Literal) {
        // Literal Template has been previously rendered
        if (object.includeRenderCount === state.renderCount) {
            // Remove object DOM nodes back to object.content
            object.remove();
            // Get current index of object
            const i = contents.indexOf(object);
            // Splice it out of contents
            contents.splice(i, 1);
        }

        // Add content into DOM and splice object into contents
        contents[++i].before(object.content);
        if (window.DEBUG) ++stats.add;
        contents.splice(i, 0, object);
        return i;
    }

    // Object is a fragment
    if (isFragment(object)) {
        const l = object.childNodes.length;
        const m = contents[++i];
        contents.splice(i, 0, ...object.childNodes);
        m.before(object);
        return i + l - 1;
    }

    // Object is a DOM node
    if (isTextNode(object) || isElement(object) || isComment(object)) {
        // Splice node into contents and the DOM
        contents[++i].before(object);
        if (window.DEBUG) ++stats.add;
        contents.splice(i, 0, object);
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
    static consts = ['DATA', 'data', 'element', 'shadow', 'host', 'id', 'include', 'print'];

    constructor(signal, literal, params, element, node, debug) {
        if (window.DEBUG && !isTextNode(node)) {
            throw new TypeError('TextRenderer() node not a text node');
        }

        const consts = assign({}, params, {
            // Make a partially applicable include()
            include: (url, data) => data === undefined ?
                (data) => this.include(url, data) :
                this.include(url, data),

            print:   (...args) => print(this, ...args)
        });

        super(signal, literal, consts, element, node, debug);

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
        // The first item in contents may be a Template
        return this.contents[0].firstNode ?
            this.contents[0].firstNode :
            this.contents[0] ;
    }

    get lastNode() {
        // The last item in contents is always the original text node
        return this.contents[this.contents.length - 1];
    }

    include(template, data) {
        const object      = Data.objectOf(data);
        const contents    = this.contents;
        const renderCount = this.renderCount;

        // Look through contents from latest includeIndex to see if ...
        let n = -1;
        while (contents[++n] !== undefined) {
            // ... included template/object pair already has a renderer
            if (contents[n].template === template
                && contents[n].object === object
                && contents[n].includeRenderCount !== renderCount) {
                // Keep a note of which render this was re-included on to avoid
                // trying to re-include the same renderer twice in one render
                contents[n].includeRenderCount = renderCount;
                // Return it
                return contents[n];
            }
        }

        // Return a new
        return include(template, data, this.element, this.consts);
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

        // An edge case. If element is contenteditable it may be children have
        // been removed from the DOM (user deleted them from contenteditable).
        // This presents a problem because Literal uses text nodes as content
        // placeholders and we don't know what child index contents should have
        // inside element. But for now, we're just going to plonk content back
        // into element in last place. Less than ideal.
        if (contents.find(notInDOM)) {
            console.warn('Literal: contents have been removed from the DOM, attempting to replace them');
            // Empty out element
            this.element.innerHTML = '';
            // Append children back in
            this.element.append.apply(this.element, contents);
        }

        // Use `this` as an accumulator for .string. It's an internal object
        // anyway, so this should not leak, but I admit doing this is a bit naff.
        // It does avoid creating any more objects though.
        this.string = '';
//if (contents && arguments[1]) console.log('PRE', Array.from(contents), Array.from(arguments[1]));
        // Loop over strings, zip objects into string
        let n = -1;
        let i = -1;
        while(++n < strings.length - 1) {
            // Add string to next output-to-text-node string
            this.string += strings[n];
            i = objectToContents(this, arguments[n + 1], i);
        }
//if (contents) console.log('POST', Array.from(contents));
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

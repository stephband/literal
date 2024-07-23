
/**
TextRenderer(source, node, path, index, message)
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert
that DOM after the text node.
**/

import Signal           from '../../../fn/modules/signal.js';
import Data             from '../../../fn/modules/signal-data.js';
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
        const contents = this.contents;
        let i      = -1;

        // Last is the original text node
        const last = contents[contents.length - 1];
        let n      = -1;
        let string = '';
        let object;

        while(++n < strings.length - 1) {
            // Add previous string in stings to output string
            string += strings[n];

            // Object may be a string, DOM node, fragment or Literal Template.
            object = arguments[n + 1];

            // If object is not a node or renderer, append to string
            if (!(object instanceof Template) && !(object instanceof Node)) {
                string += toText(object);
                continue;
            }

            // If a there is a string to splice in
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
                    contents.splice(i, 0, node);
                    if (window.DEBUG) ++stats.add;
                }

                string = '';
            }

            // It is possible that the template has returned the same object
            // again, in which case we do nothing. Unlikely, but possible.
            if (object === contents[++i]) continue;
            --i;

            if (object instanceof Template) {
                // Content is also a template. Maybe in future we will update it,
                // but for now, replace it
                // Add template content to the DOM
                contents[++i].before(toContent(object));
                contents.splice(i, 0, object);
                if (window.DEBUG) ++stats.add;
                continue;
            }

            if (isFragmentNode(object)) {
                // TODO Splice fragment content in... represent in contents
                // with a new object?
                console.log('TODO');
                continue;
            }

            // Compare object against current content
            if (isTextNode(object) || isElementNode(object) || isCommentNode(object)) {
                // Splice node into contents and the DOM
                contents[++i].before(object);
                contents.splice(i, 0, object);
                if (window.DEBUG) ++stats.add;
                continue;
            }
        }

        // Add the last string on
        string += strings[n];

        // Remove unused content up to but not including the last node
        // and .stop() it
        if (contents[++i] !== last) {
            const mid = contents[i].firstNode || contents[i];
            deleteRange(mid, last);
            if (window.DEBUG) ++stats.remove;
            contents.splice(i, contents.length - i - 1).forEach(stop);
        }

        // Set text of final text node
        setNodeValue(last, string);
    }

    stop() {
        this.contents.forEach(stop);
        this.contents.length = 0;
        return super.stop.apply(this);
    }
}

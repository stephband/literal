
/**
TextRenderer(source, node, path, index, message)
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert
that DOM after the text node.
**/

import isTextNode        from '../../../dom/modules/is-text-node.js';
import include           from '../scope/include.js';
import library           from '../scope-dom.js';
import indexOf           from '../dom/index-of.js';
import removeNodeRange   from '../dom/remove-node-range.js';
import TemplateRenderer  from '../template-renderer.js';
import print             from '../scope/print.js';
import toText            from './to-text.js';
import Renderer          from './renderer.js';


const assign = Object.assign;
const stats  = {
    add:    0,
    remove: 0,
    text:   0
};


function stop(node) {
    node && typeof node === 'object' && node.stop && node.stop();
}

function toRenderer(value) {
    return value instanceof TemplateRenderer ? value :
           value instanceof Node ? value :
           toText(value) ;
}

function pushContents(contents, object) {
    // Object may be a string, DOM node, fragment, template renderer. Here
    // we concat strings together. May have side effects on complicated DOM
    // updates, so keep an eye out.
    if (typeof object === 'string' && typeof contents[contents.length - 1] === 'string') {
        contents[contents.length - 1] += object;
    }
    else {
        contents.push(object);
    }

    return contents;
}

function composeDOM(contents, object) {
    // Flatten nested arrays of renderables
    if (Array.isArray(object)) {
        return object.reduce(composeDOM, contents);
    }

    return pushContents(contents, toRenderer(object));
}

function setNodeValue(node, value) {
    const nodeValue = node.nodeValue;

    // textNode.nodeValue = null actually results in textNode.nodeValue = ''
    if (nodeValue) {
        if (nodeValue !== value) {
            node.nodeValue = value;
            return 1;
        }
    }
    else {
        if (value) {
            node.nodeValue = value;
            return 1;
        }
    }

    return 0;
}

function toContent(object) {
    return object.content ?
        toContent(object.content) :
        object ;
}

function updateDOM(stats, first, last, objects) {
    // Sanity check
    if (window.DEBUG) {
        if (first === last) {
            throw new Error('`first` and `last` are the same node');
        }

        if (first.parentNode !== last.parentNode) {
            throw new Error('`first` and `last` are not siblings');
        }

        const iFirst   = indexOf(first);
        const iLast    = indexOf(last);
        if (iFirst > iLast) {
            throw new Error('`last` is not after `first`, first: ' + iFirst + ' last: ' + iLast);
        }
    }

    //console.log(0, 'updateDOM', first.textContent, last.textContent, objects, nLast);
    const nLast = objects.length - 1;

    // Render first object. `objects[0]` is always a string. `first` is a
    // text node.
    stats.text += setNodeValue(first, objects[0]);

    let node  = first.nextSibling;
    let n     = 0;
    while (++n < nLast) {
        const object = objects[n];

        // Is object a string
        if (typeof object === 'string') {
            // If node is a text node, use it.
            if (node !== last && isTextNode(node)) {
                stats.text += setNodeValue(node, object);
                node = node.nextSibling;
            }
            // ...otherwise insert a text node
            else {
                node.before(object);
                ++stats.add;
            }
            continue;
        }

        // Is object a TemplateRenderer with nodes already in this DOM
        if (object instanceof TemplateRenderer && (node === object.first || node === object.last)) {
            // Skip over nodes handled by the renderer
            node = object.last.nextSibling;
            continue;
        }

        // If node and object are the same thing. Could happen, I suppose, if
        // a template expression returns a cached node on successive renders.
        if (node === object) {
            node = node.nextSibling;
            continue;
        }

        // Remove template or node from wherever it currently is
        if (object.remove) {
            stats.remove += (object.remove() || 0);
        }

        // And put it here
        node.before(toContent(object));
        ++stats.add;
    }

    // Remove unused nodes up to last
    while (node !== last) {
        const nd = node;
        node = node.nextSibling;
        nd.remove();
        ++stats.remove;
    }

    // Render last object. Where objects is less than 1 item long empty `last`,
    // otherwise render last object into `last`.
    stats.text += setNodeValue(last, nLast < 1 ? null : objects[nLast]);
    return stats;
}

export default class TextRenderer extends Renderer {
    static parameterNames = ['data', 'DATA', 'element', 'host', 'shadow', 'include', 'print'];

    constructor(fn, element, name, parameters, fragment = element) {
        // Fragment may be the source fragment containing the first and last
        // text nodes, which are then rendered into element, or it may default
        // to element.

        const params = assign({}, parameters, {
            // Parameters
            include(url, data) {
                return arguments.length === 1 ?
                    // Partial application if called with url only
                    (data) => include(url, data, element, parameters) :
                    // Include immediately when data is defined
                    include(url, data, element, parameters);
            },

            print: (...args) => print(this, ...args)
        });

        super(fn, element, name, params);

        this.contents = [];
        this.first    = fragment.childNodes[this.name];
        this.last     = fragment.childNodes[this.name + 1];
    }

    push() {
        // Preemptively stop all nodes, they are about to be updated
        this.contents.forEach(stop);
        this.contents.length = 0;
        return super.push.apply(this, arguments);
    }

    update() {
        // Stop all nodes, they are about to be recreated. This needs to be done
        // here as well as in push, as update may be called by TemplateRenderer
        // without going through .push() cueing first. (??)
        this.contents.forEach(stop);
        this.contents.length = 0;
        return super.update.call(this);
    }

    render(strings) {
        let n = 0;
        this.contents.length = 0;
        this.contents.push(strings[n]);

        while (strings[++n] !== undefined) {
            composeDOM(this.contents, arguments[n]);
            pushContents(this.contents, strings[n]);
        }

        // TEMP, TODO: Make stats a global accumulator that comes from cue()?
        if (window.DEBUG) {
            stats.add    = 0;
            stats.remove = 0;
            stats.text   = 0;
        }

        updateDOM(stats, this.first, this.last, this.contents);
        this.mutations = stats.remove + stats.add + stats.text;
        return stats;
    }

    stop() {
        this.contents.forEach(stop);
        this.contents.length = 0;
        return super.stop.apply(this);
    }
}

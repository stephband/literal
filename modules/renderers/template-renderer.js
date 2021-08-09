
import get         from '../../../fn/modules/get.js';
import getPath     from '../../../fn/modules/get-path.js';
import noop        from '../../../fn/modules/noop.js';
import nothing     from '../../../fn/modules/nothing.js';
import overload    from '../../../fn/modules/overload.js';
import identify    from '../../../dom/modules/identify.js';
import isTextNode  from '../../../dom/modules/is-text-node.js';
import compileNode from '../compile-node.js';
import { Observer, observe, getTarget } from '../observer.js';
import reads       from '../observer/reads.js';
import { log }     from '../log.js';
import { cue, uncue } from './batcher.js';
import Renderer, { renderStopped, removeNodes } from './renderer.js';

const DEBUG  = window.DEBUG === true || window.DEBUG && window.DEBUG.includes('literal');

const assign = Object.assign;
const cache  = {};

function add(a, b) {
    return b + a;
}

function logCounts(counts) {
    const count = counts.reduce(add, 0);
    if (count === 0) { return; }
    //log('mutate ', counts.reduce(add, 0), '#ff7246');
}

/*
TemplateRenderer
Descendant paths are stored in the form `"1.12.3.class"`. This enables fast 
cloning of template instances without retraversing their DOMs looking for 
literal attributes and text.
*/

var renderid = 0;

function child(parent, index) {
    return /^[a-zA-Z]/.test(index) ?
        parent :
        parent.childNodes[index] ;
}

function getDescendant(path, root) {
    const p = path.split(/\./);
    return p.reduce(child, root);
}
var i = 0;

function isMarkerNode(node) {
    // Markers should be spaces-only else we risk unrendered content being 
    // inserted into the DOM. If it's not a text node, it's not a marker 
    // node because it could contain something that contains unrendered code.
    if (!isTextNode(node)) { 
        return false;
    }

    const text  = node.nodeValue;
    const space = /^\s*/.exec(text);

    // If text is more than just space return false
    return space[0].length === text.length;
}

function prepareContent(content) {
    // Due to the way HTML is usually written the vast majority of templates
    // start and end with a text node, usually containing some white space
    // and new lines. The renderer uses these as delimiters for the start and
    // end of templated content – where it can. If the template does NOT start 
    // or end with a text node, we insert text nodes where needed.
    const first = content.childNodes[0];
    const last  = content.childNodes[content.childNodes.length - 1];


    if (!isMarkerNode(first)) {
        content.prepend(document.createTextNode(''));
    }

    if (!isMarkerNode(last)) {
        content.append(document.createTextNode(''));
    }
}

function newRenderer(renderer) {
    // `this` is the content fragment of the new renderer
    const node    = getDescendant(renderer.path, this);
    const element = isTextNode(node) ? node.parentNode : node ;
    return new renderer.constructor(node, renderer, element);
}

export default function TemplateRenderer(template) {
    // TemplateRenderer may be called with a string id or a template element
    const id = typeof template === 'string' ?
        template :
        identify(template) ;

    // If the template is already compiled, clone the compiled consts and 
    // renderers to this renderer and bind them to a new fragment
    if (cache[id]) {
        const template = cache[id].template;

        this.id        = -1 * (++renderid);
        this.template  = template;
        this.content   = template.content.cloneNode(true);
        this.first     = this.content.childNodes[0];
        this.last      = this.content.childNodes[this.content.childNodes.length - 1];
        this.renderers = cache[id].renderers.map(newRenderer, this.content);
        this.observables = nothing;

        return;
    }

    template = typeof template === 'string' ?
        document.getElementById(template) :
        template ;

    if (DEBUG) {
        if (!template) {
            throw new Error('Template id="' + id + '" not found in document');
        }
        
        if (!template.content) {
            throw new Error('Element id="' + id + '" is not a <template> (no content fragment)');
        }
    }

    prepareContent(template.content);

    this.id        = -1 * (++renderid);
    this.template  = template;
    this.content   = template.content.cloneNode(true);
    this.first     = this.content.childNodes[0];
    this.last      = this.content.childNodes[this.content.childNodes.length - 1];

    // The options object contains information for renderer objects. It is 
    // mutated as it is passed to each renderer (specifically path, name, 
    // source properties) as renderer construction is synchronous within a 
    // template.
    const options = {
        template: id,
        path:     ''
    };

    this.renderers = compileNode([], options, this.content, template);
    this.observables = nothing;

    cache[id] = this;
}

function stop(object) {
    object.stop();
}

assign(TemplateRenderer.prototype, {
    cue: function(data) {
        this.observables.forEach(stop);
        this.observables = nothing;
        return Renderer.prototype.cue.apply(this, arguments);
    },

    // Default data is an empty object
    render: function(object) {
        const data = getTarget(object);

        // Deduplicate. Not sure this is entirely necessary.
        if (data === this.state) {
            if (DEBUG) {
                console.error('Attempt to render with same object as last render');
            }

            return this.content;
        }

        this.state = data;

        // Stop any previous observables where they have not already 
        // been stoppped (if we remove render() such that this can only be cued
        // remove this line
        this.observables.forEach(stop);

        const observer  = Observer(data);
        const renderers = this.renderers;

        // This has to happen synchronously in order to collect gets...
        renderers.forEach((renderer) => renderer.render(observer));

        this.observables = observer ?
            renderers.flatMap((renderer) => 
                renderer.paths.map((path) => 
                    // Don't getPath() of the observer here, that really makes 
                    // the machine think too hard
                    observe(path, data, getPath(path, data)).each((value) =>
                        // Next renders are cued which batches them
                        renderer.cue(observer)
                    )
                )
            ) :
            nothing ;

        return this.content;
    },

    stop: function() {
        // We must not empty .renderers, they are compiled and cached and may 
        // be cloned. We can stop listening to sets and make .render() a
        // noop though.
        this.renderers.forEach(stop);
        this.observables.forEach(stop);
        this.observables = nothing;
        return Renderer.prototype.stop.apply(this, arguments);
    },

    remove: function() {
        return removeNodes(this.first, this.last);
    }
});

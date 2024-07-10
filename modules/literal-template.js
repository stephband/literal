
/**
LiteralTemplate(template, element, parameters, options)

Import the `LiteralTemplate` constructor:

```js
import LiteralTemplate from './literal/modules/literal-template.js';
```

The `LiteralTemplate` constructor takes a template element (or the `id` of a
template element), clones the template's content, and returns a renderer that
renders data into the content. The renderer updates its DOM nodes in response
to changing data.

```js
const renderer = new LiteralTemplate('id');
const data     = {};

// Cue data for render then add it to the DOM
renderer
.push(data)
.then(() => document.body.append(renderer.content));
```
**/


import overload            from '../../fn/modules/overload.js';
import Signal              from '../../fn/modules/signal.js';
import Data                from '../../fn/modules/signal-data.js';
import create              from '../../dom/modules/create.js';
import identify            from '../../dom/modules/identify.js';
import isTextNode          from '../../dom/modules/is-text-node.js';
import { pathSeparator }   from './compile/constants.js';
import removeNodeRange     from './dom/remove-node-range.js';
import Renderer, { stats } from './renderer.js';
import getNodeRange        from './dom/get-node-range.js';
import compileNode         from './compile.js';
import { groupCollapsed, groupEnd } from './log.js';

const assign = Object.assign;
const keys   = Object.keys;
const cache  = {};
const nodes  = [];
const defaults = {};


function dataToString() {
    return this.data + '';
}

/*
LiteralTemplate
Descendant paths are stored in the form `"#id>1>12>3"`, enabling fast
cloning of template instances without retraversing their DOMs looking for
literal attributes and text.
*/

function getChild(element, index) {
    return element.childNodes[index] ;
}

function getElement(path, node) {
    return path
        .split(pathSeparator)
        .reduce(getChild, node) ;
}

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
    // and new lines. LiteralTemplate uses these as delimiters for the start
    // and end of templated content – where it can. If the template does NOT
    // start or end with a text node, we insert text nodes where needed.
    const first = content.childNodes[0];
    const last  = content.childNodes[content.childNodes.length - 1];

    if (!first || !isMarkerNode(first)) {
        content.prepend(create('text'));
    }

    if (!last || !isMarkerNode(last)) {
        content.append(create('text'));
    }
}

function compileTemplate(template, id, options) {
    const content = template.content
        || create('fragment', template.childNodes, template) ;

    if (window.DEBUG) { groupCollapsed('compile', '#' + id, 'yellow'); }
    prepareContent(content);
    // compile(fragment, message, options)
    const targets = compileNode(content, '#' + id, options);
    if (window.DEBUG) { groupEnd(); }

    return { content, targets };
}

const R = Renderer;
function createRenderer(target) {
    const { Renderer, path, name, fn } = target;

    // Where `.path` exists find the element at the end of the path
    const element  = path ? getElement(path, this.content) : this.element ;
    const renderer = path ?
        new Renderer(fn, element, name, this.parameters, this.datasignal) :
        // Where `.path` is an empty string we are dealing with the `.content`
        // fragment, which must be rendered into the `.element` element. Only a
        // TextRenderer can have an empty path.
        new Renderer(fn, element, name, this.parameters, this.datasignal, this.content) ;

    //const renderer = R.create(element, name, fn, this.parameters, path ? undefined : this.content);

    // Stop clone when parent template renderer stops
    this.done(renderer);
    return renderer;
}

export default class LiteralTemplate {
    constructor(template, element = template.parentElement, parameters = {}, options = defaults) {
        const id = identify(template) ;

        const compiled = cache[id] ||
            (cache[id] = compileTemplate(template, id, {
                nostrict: options.nostrict || (template.hasAttribute && template.hasAttribute('nostrict'))
            }));

        const content = compiled.content.cloneNode(true);

        this.datasignal = Signal.of();
        this.content    = content;
        this.element    = element;
        this.parameters = parameters;
        this.first      = content.childNodes[0];
        this.last       = content.childNodes[content.childNodes.length - 1];
        this.contents   = compiled.targets.map(createRenderer, this);
    }

    get data() {
        return this.datasignal.value;
    }

    set data(data) {
        if (this.status === 'done') return;

        this.datasignal.value = Data(data);

        // Do we actually need to cue? I mean, the push on each child renderer
        // is cue()d so why do we need to do it here?
        //
        // Well, at the moment we need to do it here because in update()
        // children are appended to the DOM synchronously around line 230. And
        // perhaps this is for the best: why cue multiple renderers when you can
        // cue just this one, after all? Hmmm.
        //cue(this);
        // Nah lets not cue here ...
        this.update();
    }

    push() {
        console.trace('.push() from where?');
    }

    update = overload(dataToString, {
        null: function() {
            // Remove all but the last node to the renderer's content fragment
            nodes.length = 0;
            let node = this.first;

            while (node !== this.last) {
                nodes.push(node);
                node = node.nextSibling;
            }

            this.content.prepend.apply(this.content, nodes);
            stats.remove += nodes.length;
        },

        default: function() {
            //console.log(this.constructor.name + (this.id ? '#' + this.id : '') + '.render()');
            const data = this.data;

            // Render the contents (synchronously)
            this.contents.forEach((renderer) => {
                renderer.data = data;
                renderer.update();
            });

            // If this.last is not in the content fragment, it must be in the
            // parent DOM being used as a marker. It's time for its freshly
            // rendered brethren to join it.
            if (this.content.lastChild && this.last !== this.content.lastChild) {
                this.last.before(this.content);
                stats.add += 1;
            }

            return this;
        }
    })

    /**
    .remove()
    Removes rendered content from the DOM, placing it back in the
    fragment at `renderer.content`.
    **/
    remove() {
        // Can't remove if we're already removed
        if (this.content.lastChild === this.last) {
            return 0;
        }

        // Remove first to last and all nodes in between to .content fragment
        const nodes = getNodeRange(this.first, this.last);
        this.content.prepend.apply(this.content, nodes);
        stats.remove += nodes.length;
        return nodes.length;
    }

    /**
    .replaceWith()
    Removes rendered content from the DOM and inserts arguments in its place.
    **/
    replaceWith() {
        // Can't replace if we're removed
        if (this.content.lastChild === this.last) {
            return 0;
        }

        this.last.after.apply(this.last, arguments);
        stats.add += arguments.length;
        return this.remove();
    }

    /**
    .stop()
    Stops renderer.
    **/
    stop = Renderer.prototype.stop;

    /**
    .done(object)
    Registers `object.stop()` to be called when this renderer is stopped.
    **/
    done = Renderer.prototype.done;
}

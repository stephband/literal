
/**
TextRenderer(source, node, path, index, message)
Constructs an object responsible for rendering to a text node. If the result of
processing the literal content is more DOM content this renderer will insert
that DOM after the text node.
**/

import Signal      from 'fn/signal.js';
import Data        from 'fn/data.js';
import create      from 'dom/create.js';
import isComment   from 'dom/is-comment.js';
import isElement   from 'dom/is-element.js';
import isFragment  from 'dom/is-fragment.js';
import isTextNode  from 'dom/is-text-node.js';
import deleteRange from '../dom/delete-range.js';
import toText      from './to-text.js';
import Renderer, { stats } from './renderer.js';
import Literal     from '../literal.js';
import include, { Include } from '../scope/include.js';
import safe        from '../scope/safe.js';
import print, { Print, printError, printNode } from '../print.js';


const DEBUG        = globalThis.DEBUG;
const assign       = Object.assign;
const define       = Object.defineProperties;
const emptyStrings = Object.freeze(['', '']);


function stop(node) {
    node && typeof node === 'object' && node.stop && node.stop();
}

function setNodeValue(node, value) {
    const nodeValue = node.nodeValue;

    // textNode.nodeValue = null actually results in textNode.nodeValue = ''
    if (nodeValue) {
        if (nodeValue !== value) {
            node.nodeValue = value;
            if (DEBUG) ++stats.text;
        }
    }
    else {
        if (value) {
            node.nodeValue = value;
            if (DEBUG) ++stats.text;
        }
    }
}

function takeInclude(cache, identifier, key) {
    // Bail if no previous include cache or bucket exists
    if (!cache) return;
    const bucket = cache.get(identifier);
    if (!bucket) return;
    const entry = bucket.get(key);
    if (!entry) return;

    // Duplicate includes for the same key are queued in an array
    if (Array.isArray(entry)) {
        const literal = entry.shift();
        if (!entry.length) bucket.delete(key);
        return literal;
    }

    // Claim the single cached Literal so duplicates create fresh instances
    bucket.delete(key);
    return entry;
}

function putInclude(cache, identifier, key, literal) {
    // Get or create per-template bucket Map
    let bucket = cache.get(identifier);
    if (!bucket) {
        bucket = new Map();
        cache.set(identifier, bucket);
    }

    // Store single Literal directly; promote to array only on duplicate keys
    const existing = bucket.get(key);
    if (!existing) {
        bucket.set(key, literal);
    }
    else if (Array.isArray(existing)) {
        existing.push(literal);
    }
    else {
        bucket.set(key, [existing, literal]);
    }
}

function pushUnique(next, nextSet, item) {
    // A DOM node or Literal can only occupy one position; latest position wins
    if (nextSet.has(item)) {
        const idx = next.indexOf(item);
        if (idx !== -1) next.splice(idx, 1);
    }
    else {
        nextSet.add(item);
    }
    next.push(item);
}

function resolveObject(renderer, object, oldIncludes, nextIncludes, next, nextSet) {
    // Primitives and plain objects append directly to the text accumulator
    if (!(object instanceof Include)
     && !(object instanceof Literal)
     && !(object instanceof Node)
     && !(window.DEBUG && object instanceof Print)
     && !Array.isArray(object)) {
        renderer.string += toText(object);
        return;
    }

    // Flatten nested arrays recursively without creating empty text nodes
    if (Array.isArray(object)) {
        let n = -1;
        while (++n < object.length) {
            resolveObject(renderer, object[n], oldIncludes, nextIncludes, next, nextSet);
        }
        return;
    }

    // Flush any accumulated text segment before the node or Literal
    if (renderer.string) {
        next.push(renderer.string);
        renderer.string = '';
    }

    // Resolve a print() debug descriptor to its <pre> element
    if (window.DEBUG && object instanceof Print) {
        const node = printNode(renderer, object.args);
        if (node) pushUnique(next, nextSet, node);
        return;
    }

    // Resolve an include() descriptor from cache or instantiate a new Literal
    if (object instanceof Include) {
        const { identifier, data } = object;
        const key = Data.objectOf(data);
        const literal = takeInclude(oldIncludes, identifier, key)
            || Literal.create(identifier, data, renderer.parameters);

        // Store in next render's include cache and append to target list
        putInclude(nextIncludes, identifier, key, literal);
        pushUnique(next, nextSet, literal);
        return;
    }

    // Direct Literal instance
    if (object instanceof Literal) {
        pushUnique(next, nextSet, object);
        return;
    }

    // Unpack DocumentFragment children in DOM order
    if (isFragment(object)) {
        const children = object.childNodes;
        let n = -1;
        while (children[++n]) {
            pushUnique(next, nextSet, children[n]);
        }
        return;
    }

    // Single DOM node (Text, Element, Comment)
    if (isTextNode(object) || isElement(object) || isComment(object)) {
        pushUnique(next, nextSet, object);
    }
}

function longestIncreasingSubsequence(sources) {
    const length = sources.length;
    // tails[k] holds the index in `sources` of the smallest tail for length k + 1
    const tails  = [];
    const preds  = new Int32Array(length);

    let j = -1;
    while (++j < length) {
        const value = sources[j];
        // Ignore newly inserted items
        if (value < 0) continue;

        // Fast path: extends the longest increasing subsequence found so far
        const last = tails.length - 1;
        if (last < 0 || sources[tails[last]] < value) {
            preds[j] = last < 0 ? -1 : tails[last];
            tails.push(j);
            continue;
        }

        // Binary search for the smallest tail >= value
        let lo = 0;
        let hi = last;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (sources[tails[mid]] < value) lo = mid + 1;
            else hi = mid;
        }

        // Update tail and link predecessor
        preds[j]  = lo > 0 ? tails[lo - 1] : -1;
        tails[lo] = j;
    }

    // Backtrack from end of longest subsequence and flag anchored positions
    const anchored = new Uint8Array(length);
    let idx = tails.length ? tails[tails.length - 1] : -1;
    while (idx !== -1) {
        anchored[idx] = 1;
        idx = preds[idx];
    }

    return anchored;
}


function clearDynamicContents(contents, oldLen, last) {
    // Delete all dynamic items before last in one Range when parent matches
    const first = contents[0].firstNode || contents[0];
    if (first.parentNode === last.parentNode) {
        deleteRange(first, last);
    }
    else {
        let k = -1;
        while (++k < oldLen) {
            const item = contents[k];
            const node = item instanceof Literal ? item.firstNode : item;
            if (node && node.parentNode !== null) item.remove();
        }
    }

    if (DEBUG) ++stats.remove;
    contents.splice(0, oldLen).forEach(stop);
}


/**
TextRenderer()
Renders a text node. Text node literals may evaluate to DOM nodes or fragments,
template renderers, or strings.
**/

export default class TextRenderer extends Renderer {
    constructor(fn, parameters, element, node, compiled) {
        if (DEBUG && !isTextNode(node)) {
            throw new TypeError('TextRenderer() node not a text node');
        }

        // Defines .fn, .parameters (DOM helpers passed as shared static refs)
        super(fn, assign({}, parameters, {
            element,
            create,
            include,
            safe,
            print
        }), compiled);

        // Only for edge case in render()
        this.element = element;
        // The last item in contents will always be the original text node
        this.contents = [node];
        // String accumulator for render cycle, private
        this.string = '';
        // The last node is always the last node and ever shall be
        define(this, { lastNode: { value: node }});

        // A synchronous evaluation while data signal value is undefined binds
        // this renderer to changes to that signal. If signal value is a `data`
        // object evaluation renders the renderer immediately.
        if (Signal.evaluate(this, this.evaluate) || Signal.hasInvalidDependency) this.cue();
    }

    get firstNode() {
        // The first item in contents may be a Template
        return this.contents[0].firstNode ?
            this.contents[0].firstNode :
            this.contents[0] ;
    }

    evaluate() {
        if (DEBUG) {
            try {
                return super.evaluate();
            }
            catch(error) {
                // Error object, renderer, DATA
                const elem = printError(this.compiled, error);
                this.render(emptyStrings, elem);
                //throw new Error('Literal', { cause: error });
                return;
            }
        }

        return super.evaluate();
    }

    renderSingle(value) {
        // Zero-allocation fast path for primitive single expressions
        if (!(value instanceof Include)
         && !(value instanceof Literal)
         && !(value instanceof Node)
         && !(window.DEBUG && value instanceof Print)
         && !Array.isArray(value)) {
            const { contents } = this;
            const oldLen = contents.length - 1;
            const last   = contents[oldLen];

            // Recover anchor text node if contenteditable or external code detached it
            if (last.parentNode === null && this.element) {
                console.warn('Literal: contents have been removed from the DOM, attempting to replace them');
                this.element.append(last);
            }

            if (oldLen) {
                clearDynamicContents(contents, oldLen, last);
                this.includes = undefined;
            }
            setNodeValue(last, toText(value));
            return;
        }

        // Dynamic values reuse render() with the shared empty strings tuple
        this.render(emptyStrings, value);
    }

    render(strings) {
        const { contents } = this;
        const oldLen = contents.length - 1;
        // Last is the original text node
        const last   = contents[oldLen];

        // Recover anchor text node if contenteditable or external code detached it
        if (last.parentNode === null && this.element) {
            console.warn('Literal: contents have been removed from the DOM, attempting to replace them');
            this.element.append(last);
        }

        // Reset text accumulator for this render cycle
        this.string = '';

        // Allocate reconciliation state lazily so pure-text renders allocate nothing
        let next;
        let nextSet;
        let nextIncludes;
        const oldIncludes = this.includes;

        // Loop over strings and expression values
        let n = -1;
        while (++n < strings.length - 1) {
            this.string += strings[n];
            const value = arguments[n + 1];

            // Fast path: primitives append directly to text accumulator
            if (!(value instanceof Include)
             && !(value instanceof Literal)
             && !(value instanceof Node)
             && !(window.DEBUG && value instanceof Print)
             && !Array.isArray(value)) {
                this.string += toText(value);
                continue;
            }

            // Allocate reconciliation structures on first non-primitive value
            if (!next) {
                next    = [];
                nextSet = new Set();
            }
            if (!nextIncludes && (value instanceof Include || Array.isArray(value))) {
                nextIncludes = new Map();
            }

            resolveObject(this, value, oldIncludes, nextIncludes, next, nextSet);
        }

        // Append trailing static string
        this.string += strings[n];

        // Fast path: pure text output with no dynamic nodes or Literals
        if (!next || !next.length) {
            if (oldLen) clearDynamicContents(contents, oldLen, last);
            this.includes = undefined;
            setNodeValue(last, this.string);
            return;
        }

        // Reuse existing text nodes in place for string segments at matching positions
        const nextLen = next.length;
        for (let j = 0; j < nextLen; ++j) {
            if (typeof next[j] === 'string'
             && j < oldLen
             && isTextNode(contents[j])
             && !nextSet.has(contents[j])) {
                setNodeValue(contents[j], next[j]);
                next[j] = contents[j];
                nextSet.add(contents[j]);
            }
        }

        // Phase A: remove and stop obsolete items; index surviving items in DOM order
        const oldIndex = new Map();
        let keptCount = 0;

        for (let k = 0; k < oldLen; ++k) {
            const item = contents[k];
            if (nextSet.has(item)) {
                oldIndex.set(item, keptCount++);
            }
            else {
                const node = item instanceof Literal ? item.firstNode : item;
                if (node && node.parentNode !== null) item.remove();
                stop(item);
                if (DEBUG) ++stats.remove;
            }
        }

        // Phase B: map target items to surviving indices and detect any reordering
        const sources = new Int32Array(nextLen);
        let maxIdx = -1;
        let moved  = false;

        for (let j = 0; j < nextLen; ++j) {
            const idx = oldIndex.get(next[j]);
            if (idx === undefined) {
                sources[j] = -1;
            }
            else {
                sources[j] = idx;
                if (idx < maxIdx) moved = true;
                else maxIdx = idx;
            }
        }

        // Compute LIS only when surviving items actually changed relative order
        const anchored = moved ? longestIncreasingSubsequence(sources) : null;

        // Phase C: walk backwards from `last`, inserting new and moving non-LIS items
        let anchor = last;

        for (let j = nextLen - 1; j >= 0; --j) {
            const item = next[j];
            const src  = sources[j];

            // New text segment: create text node and insert before anchor
            if (typeof item === 'string') {
                const node = document.createTextNode(item);
                anchor.before(node);
                if (DEBUG) ++stats.add;
                next[j] = node;
                anchor  = node;
                continue;
            }

            // Surviving item already in correct relative order: leave untouched in DOM
            if (src !== -1 && (!anchored || anchored[j])) {
                anchor = item instanceof Literal ? item.firstNode : item;
                continue;
            }

            // New or out-of-order Literal: detach if moving, then insert fragment
            if (item instanceof Literal) {
                if (src !== -1) item.remove();
                anchor.before(item.fragment);
                if (DEBUG) ++stats.add;
                anchor = item.firstNode;
                continue;
            }

            // New or out-of-order DOM node: .before() inserts or moves in one call
            anchor.before(item);
            if (DEBUG) ++stats.add;
            anchor = item;
        }

        // Update trailing text node and commit contents + include cache
        setNodeValue(last, this.string);
        next.push(last);
        this.contents = next;
        this.includes = nextIncludes && nextIncludes.size ? nextIncludes : undefined;
    }

    stop() {
        // Stop all active Literal instances in contents and release include cache
        this.contents.forEach(stop);
        this.contents.length = 0;
        if (this.includes) this.includes.clear();
        return super.stop();
    }

    static consts = ['DATA', 'data', 'element', 'shadow', 'host', 'id', 'create', 'include', 'safe', 'print'];
}

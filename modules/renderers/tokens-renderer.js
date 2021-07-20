
import overload  from '../../../fn/modules/overload.js';
import library   from '../library.js';
import compile   from '../compile.js';
import toText    from '../to-text.js';
import Renderer  from './renderer.js';

const assign = Object.assign;

const nothing = [];

/** 
TokensRenderer()
Constructs an object responsible for rendering to a token list attribute such
as a class attribute.
**/

const getTokenList = overload((node, name) => name, {
    'class': (node) => node.classList
});

function valueify(values, value) {
    // If value is an array, it may have come from on include and be a set of 
    // DOM nodes, ... right ? This is probably not the best way to detect that.
    if (value instanceof Node) {
        values.push(value);
    }
    else if (value && typeof value === 'object' && value.length !== undefined) {
        values.push.apply(values, value);
    }
    else {
        values.push(toText(value));
    }
}

function renderValues(args) {
    const [strings] = args;
    const values = [];
    var n = -1 ;
    var value;

    while (strings[++n] !== undefined) {
        // Don't strip spaces, but do ignore empty strings
        if (strings[n]) {
            values.push(strings[n]);
        }

        // If a value is more than nothing push it in
        value = args[n + 1];
        if (value !== undefined && value !== '') {
            valueify(values, value);
        }
    }

    return values;
}

function setTokens(list, cached, tokens, count) {
    // Remove tokens from the cache that are found in new tokens.
    let n = cached.length;
    while (n--) {
        if (tokens.indexOf(cached[n]) !== -1) {
            cached.splice(n, 1);
        }
    }

    // Remove the remainder from the list
    if (cached.length) {
        list.remove.apply(list, cached);
        ++count;
    }

    // Then add the new tokens. The TokenList object ignores tokens it 
    // already contains.
    list.add.apply(list, tokens);
    return ++count;
}

export default function TokensRenderer(node, options) {
    Renderer.apply(this, arguments);
    
    const list = getTokenList(node, options.name);
    let cached = nothing;

    this.literal = options.literal || compile(library, options.consts, options.source, null, 'arguments[1]');
    this.name    = options.name;
    this.update  = (tokens) => {
        const count = setTokens(list, cached, tokens, 0);
        cached = tokens;
        // Count 1 for removing, 1 for adding
        return count;
    };

    // Empty the token list until it is rendered
    node.setAttribute(this.name, '');
}

assign(TokensRenderer.prototype, Renderer.prototype, {
    resolve: renderValues
});

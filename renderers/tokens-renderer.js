
import overload  from '../../fn/modules/overload.js';
import library   from '../modules/library.js';
import compile   from '../modules/compile.js';
import toText    from '../modules/to-text.js';
import Renderer  from './renderer.js';
import analytics from './analytics.js';

const A      = Array.prototype;
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

function valueify(value) {
    return (value && typeof value === 'object' && value.length !== undefined) ?
        value.join(' ') :
        toText(value) ;
}

function updateTokens(list, cached, tokens, count) {
    // Remove all tokens from cached that are found in new tokens
    let n = cached.length;
    while (n--) {
        if (tokens.includes(cached[n])) {
            cached.splice(n, 1);
        }
    }

    // The remainder are not in values and thus must be removed
    if (cached.length) {
        list.remove.apply(list, cached);
        ++count;
    }

    // Add the new tokens. The list object (a TokenList) ignores tokens it
    // already contains, so it is safe to set doubles. Return DOM mutation count
    // for logging
    if (tokens.length) {
        list.add.apply(list, tokens);
        ++count
    }

    return count;
}

export default function TokensRenderer(node, options) {
    Renderer.apply(this, arguments);

    this.name      = options.name;
    this.list      = getTokenList(node, options.name);
    this.tokens    = nothing;
    this.literally = options.literally || compile(library, 'data, element', options.source, null, options, node);

    // Empty the tokens until it is rendered to avoid code in literals
    // being interpreted as classes
    node.setAttribute(this.name, '');

    // Analytics
    const id = '#' + options.template;
    ++analytics[id].class || (analytics[id].class = 1);
    ++analytics.Totals.class;
}

assign(TokensRenderer.prototype, Renderer.prototype, {
    compose: function(strings) {
        let count = 0;

        // Set permanent tokens on first render only
        if (this.count === 1) {
            const tokens = strings.join(' ').trim().split(/\s+/);
            this.list.add.apply(this.list, tokens);
            ++count;
        }

        // Turn evaluated values into an array of strings
        const tokens = A.slice.call(arguments, 1)
            .map(valueify)
            .filter((string) => !!string);

        count = updateTokens(this.list, this.tokens, tokens, count);
        this.tokens  = tokens;
        return count;
    }
});

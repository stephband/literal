
import overload from '../../fn/modules/overload.js';
import library  from './library-dom.js';
import Renderer from './renderer.js';
import toText   from './to-text.js';

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

export default function TokensRenderer(source, consts, template, path, node, name, message, parameters) {
    Renderer.call(this, source, library, assign({}, parameters, { element: node }), consts, message);

    this.template = template;
    this.path     = path;
    this.node     = node;
    this.name     = name;
    this.list     = getTokenList(node, name);
    this.tokens   = nothing;
    this.renders  = 0;

    // Empty the tokens until it is rendered to avoid code in literals
    // being interpreted as tokens
    node.setAttribute(name, '');
}

assign(TokensRenderer.prototype, Renderer.prototype, {
    render: function(strings) {
        let mutations = 0;

        // Set permanent tokens on first render only
        if (++this.renders === 1) {
            const tokens = strings
                .join(' ')
                .trim();

            if (tokens) {
                this.list.add.apply(this.list, tokens.split(/\s+/));
                ++mutations;
            }
        }

        // Turn evaluated values into an array of strings
        const tokens = A.slice.call(arguments, 1)
            .map(toText)
            .join(' ')
            .trim()
            .split(/\s+/)
            .filter((string) => !!string);

        this.mutations = updateTokens(this.list, this.tokens, tokens, mutations);
        this.tokens    = tokens;
        return this;
    }
});

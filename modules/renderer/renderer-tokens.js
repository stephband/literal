
import overload          from '../../../fn/modules/overload.js';
import toText            from './to-text.js';
import AttributeRenderer from './renderer-attribute.js';

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

export default function TokensRenderer(source, element, name, path, paramstring, message) {
    AttributeRenderer.apply(this, arguments);
    this.list        = getTokenList(element, name);
    this.tokens      = nothing;

    // Empty the tokens until it is rendered to avoid code in literals
    // being interpreted as tokens.
    this.element.setAttribute(name, '');
}

assign(TokensRenderer.prototype, AttributeRenderer.prototype, {
    render: function(strings) {
        let mutations = 0;

        // Set permanent tokens on first render only
        if (this.renderCount === 1) {
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
    },

    clone: function(element) {
        return assign(AttributeRenderer.prototype.clone.apply(this, arguments), {
            list:   getTokenList(element, this.name),
            tokens: nothing
        });
    }
});

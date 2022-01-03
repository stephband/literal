
import overload  from '../../fn/modules/overload.js';
import library   from '../modules/library.js';
import compile   from '../modules/compile.js';
import toText    from '../modules/to-text.js';
import Renderer  from './renderer.js';
import analytics from './analytics.js';

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

function renderValues(args) {
    const [strings] = args;
    var string = '';
    var n = -1 ;
    var value;

    while (strings[++n] !== undefined) {
        // Don't strip spaces, but do ignore empty strings
        if (strings[n]) {
            string += ' ' + strings[n];
        }

        // If a value is more than nothing push it in
        value = args[n + 1];
        if (value !== undefined && value !== '') {
            string += ' ' + valueify(value);
        }
    }

    return string;
}

function setTokens(tokens, cached, values, count) {
    // Remove tokens from the cache that are found in new tokens.
    let n = cached.length;

    while (n--) {
        if (tokens.contains(cached[n])) {
            cached.splice(n, 1);
        }
    }

    // Remove the remainder from the tokens
    if (cached.length) {
        tokens.remove.apply(tokens, cached);
        ++count;
    }

    // Then add the new tokens. The TokenList object ignores tokens it
    // already contains so doubles are not set.
    tokens.add.apply(tokens, values);
    return ++count;
}

export default function TokensRenderer(node, options) {
    Renderer.apply(this, arguments);

    this.name      = options.name;
    this.tokens    = getTokenList(node, options.name);
    this.cached    = nothing;
    this.literally = options.literally || compile(library, 'data, element', options.source, null, options, node);

    // Empty the tokens until it is rendered to avoid words in literal tags
    // being interpreted as classes
    node.setAttribute(this.name, '');

    // Analytics
    const id = '#' + options.template;
    ++analytics[id].class || (analytics[id].class = 1);
    ++analytics.Totals.class;
}

assign(TokensRenderer.prototype, Renderer.prototype, {
    compose: function() {
        const string  = renderValues(arguments);
        const classes = string.trim().split(/\s+/);
        const count   = setTokens(this.tokens, this.cached, classes, 0);
        this.cached = classes;
        return count;
    }
});

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
        if (tokens.indexOf(cached[n]) !== -1) {
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
    
    const tokens = getTokenList(node, options.name);
    let cached = nothing;

    this.literal = options.literal || compile(library, options.source, null, 'arguments[1]', options, node);
    this.name    = options.name;
    this.update  = (string) => {
        const classes = string.trim().split(/\s+/);
        const count   = setTokens(tokens, cached, classes, 0);
        cached = classes;
        return count;
    };

    // Empty the tokens until it is rendered to avoid words in literal tags
    // being interpreted as classes
    node.setAttribute(this.name, '');
}

assign(TokensRenderer.prototype, Renderer.prototype, {
    resolve: renderValues
});


import id                from 'fn/id.js';
import nothing           from 'fn/nothing.js';
import overload          from 'fn/overload.js';
import Signal            from 'fn/signal.js';
import toText            from './to-text.js';
import AttributeRenderer from './renderer-attribute.js';
import { stats }         from './renderer.js';


const A       = Array.prototype;

/**
TokensRenderer(signal, literal, consts, element, name)
Constructs an object responsible for rendering to a token list attribute such
as a class attribute.
**/

function updateTokens(list, cached, tokens, count = 0) {
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
        if (window.DEBUG) ++stats.tokens;
    }

    // Add the new tokens. The list object (a TokenList) ignores tokens it
    // already contains, so it is safe to set doubles. Return DOM mutation count
    // for logging
    if (tokens.length) {
        list.add.apply(list, tokens);
        if (window.DEBUG) ++stats.tokens;
    }

    if (window.DEBUG) ++stats.tokens;
}

export default class TokensRenderer extends AttributeRenderer {
    constructor(fn, parameters, element, name, debug) {
        super(fn, parameters, element, name, debug, false);

        // Renderer properties
        this.list   = element[this.property];
        this.tokens = nothing;

        // A synchronous evaluation while data signal value is undefined binds
        // this renderer to changes to that signal. If signal value is an `data`
        // object it renders the renderer immediately.
        Signal.evaluate(this, this.evaluate);
    }

    render(strings) {
        // Set permanent tokens from strings on first render
        if (this.count === 1) {
            const tokens = strings.join(' ').trim();
            if (tokens) {
                const array = tokens.split(/\s+/);
                this.list.add.apply(this.list, array);
                if (window.DEBUG) stats.token += 1;
            }
        }

        // Concat remaining expression values into a spaced string
        let n      = 0;
        let string = '';
        while (strings[++n] !== undefined) {
            const text = toText(arguments[n]);
            if (text) string += ' ' + text;
        }

        // Split into tokens
        const tokens = string ?
            string.trim().split(/\s+/) :
            nothing ;

        // Set new tokens, remove unused tokens
        updateTokens(this.list, this.tokens, tokens);
        this.tokens = tokens;
    }
}


import id                from '../../../fn/modules/id.js';
import overload          from '../../../fn/modules/overload.js';
import Signal            from '../../../fn/modules/signal.js';
import toText            from './to-text.js';
import AttributeRenderer from './renderer-attribute.js';
import { stats }         from './renderer.js';


const A       = Array.prototype;
const nothing = [];

/**
TokensRenderer(signal, literal, parameters, element, name)
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

export default class TokensRenderer extends AttributeRenderer {
    static parameterNames = AttributeRenderer.parameterNames;

    constructor(signal, literal, parameters, element, name, debug) {
        super(signal, literal, parameters, element, name, debug);

        // Renderer properties
        this.list   = element[this.property];
        this.tokens = nothing;

        // A synchronous evaluation while data signal value is undefined binds
        // this renderer to changes to that signal. If signal value is an `data`
        // object it renders the renderer immediately.
        Signal.evaluate(this, this.evaluate);
    }

    render(strings) {
        let mutations = 0;

        // Set permanent tokens on first render only
        if (this.renderCount === 1) {
            const tokens = strings
                .join(' ')
                .trim();

            if (tokens) {
                const array = tokens.split(/\s+/);
                this.list.add.apply(this.list, array);
                stats.token += array.length;
            }
        }

        // Turn evaluated values into an array of strings
        const tokens = A.slice.call(arguments, 1)
            .map(toText)
            .join(' ')
            .trim()
            .split(/\s+/)
            .filter((string) => !!string);

        stats.token += updateTokens(this.list, this.tokens, tokens);
        this.tokens = tokens;
    }
}

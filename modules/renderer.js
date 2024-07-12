
import names               from './renderer/property-names.js';
import Renderer, { stats } from './renderer/renderer.js';
import AttributeRenderer   from './renderer/renderer-attribute.js';
import BooleanRenderer     from './renderer/renderer-boolean.js';
import CheckedRenderer     from './renderer/renderer-checked.js';
import TokensRenderer      from './renderer/renderer-tokens.js';
import ValueRenderer       from './renderer/renderer-value.js';
import TextRenderer        from './renderer/renderer-text.js';

Renderer.create = function create(signal, fn, parameters, element, n) {
    const name = typeof n === 'string' && (names[n] || n) ;

    return name ?
        // Return some type of attribute renderer
        name === 'value' ?
            new ValueRenderer(signal, fn, parameters, element) :
        name === 'checked' ?
            new CheckedRenderer(signal, fn, parameters, element) :
        typeof element[name] === 'boolean' ?
            new BooleanRenderer(signal, fn, parameters, element, n) :
        typeof element[name] === 'object' && element[name].add && element[name].remove ?
            new TokensRenderer(signal, fn, parameters, element, n) :
        new AttributeRenderer(signal, fn, parameters, element, n) :
    // Assume n is a text node
    new TextRenderer(signal, fn, parameters, element, n) ;
};

export { stats };
export default Renderer;

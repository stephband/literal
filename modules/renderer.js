
import names               from './renderer/property-names.js';
import Renderer, { stats } from './renderer/renderer.js';
import AttributeRenderer   from './renderer/renderer-attribute.js';
import BooleanRenderer     from './renderer/renderer-boolean.js';
import CheckedRenderer     from './renderer/renderer-checked.js';
import TokensRenderer      from './renderer/renderer-tokens.js';
import ValueRenderer       from './renderer/renderer-value.js';
import TextRenderer        from './renderer/renderer-text.js';

const assign = Object.assign;

function throwError(message, element, n) {
    throw new Error(message);
}

assign(Renderer, {
    create: function(element, n, data, fn, parameters, content) {
        const name = names[n] || n;

        // If name is an index
        return typeof n === 'number' ?
            // of text node
            element.childNodes[n].nodeType === 3 ?
                // Return a text renderer
                new TextRenderer(data, fn, element, n, parameters, content) :
            throwError('Renderer.create() – child at index ' + n + ' is not a text node', element, n) :
            // Return some type of attribute renderer
            name === 'value'   ?
                new ValueRenderer(data, fn, element, n, parameters) :
            name === 'checked' ?
                new CheckedRenderer(data, fn, element, n, parameters) :
            typeof element[name] === 'object' && element[name].add && element[name].remove ?
                new TokensRenderer(data, fn, element, n, parameters) :
            typeof element[name] === 'boolean' ?
                new BooleanRenderer(data, fn, element, n, parameters) :
            new AttributeRenderer(data, fn, element, n, parameters) ;
    }
});

export { stats };
export default Renderer;

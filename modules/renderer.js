import Renderer, { stats } from './renderer/renderer.js';
import AttributeRenderer   from './renderer/renderer-attribute.js';
import BooleanRenderer     from './renderer/renderer-boolean.js';
import CheckedRenderer     from './renderer/renderer-checked.js';
import TokensRenderer      from './renderer/renderer-tokens.js';
import ValueRenderer       from './renderer/renderer-value.js';
import TextRenderer        from './renderer/renderer-text.js';

const assign = Object.assign;

const renderers = {
    class:          TokensRenderer,
    value:          ValueRenderer,
    checked:        CheckedRenderer,
    async:          BooleanRenderer,
    autofocus:      BooleanRenderer,
    autoplay:       BooleanRenderer,
    controls:       BooleanRenderer,
    defer:          BooleanRenderer,
    disabled:       BooleanRenderer,
    formnovalidate: BooleanRenderer,
    hidden:         BooleanRenderer,
    ismap:          BooleanRenderer,
    itemscope:      BooleanRenderer,
    loop:           BooleanRenderer,
    multiple:       BooleanRenderer,
    muted:          BooleanRenderer,
    nomodule:       BooleanRenderer,
    novalidate:     BooleanRenderer,
    open:           BooleanRenderer,
    readonly:       BooleanRenderer,
    required:       BooleanRenderer,
    reversed:       BooleanRenderer,
    selected:       BooleanRenderer,
    default:        BooleanRenderer
};

function throwError(message, element, n) {
    console.log(element.childNodes[n]);
    throw new Error(message);
}

assign(Renderer, {
    create: function(element, n, fn, parameters, something) {
        const Renderer =  typeof n === 'number' ? TextRenderer :
            renderers[n] ||
            AttributeRenderer ;

        console.log('CREATE', Renderer);

        // If name is an index
        return typeof n === 'number' ?
            // of text node
            element.childNodes[n].nodeType === 3 ?
                // Return a text renderer
                new Renderer(fn, element, n, parameters, something) :
            throwError('Renderer.create() – child at index ' + n + ' is not a text node', element, n) :
            // Return some type of attribute renderer
            new Renderer(fn, element, n, parameters, something) ;
    }
});

export { stats };
export default Renderer;

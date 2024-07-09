import Renderer          from './renderer/renderer.js';
import AttributeRenderer from './renderer/renderer-attribute.js';
import BooleanRenderer   from './renderer/renderer-boolean.js';
import CheckedRenderer   from './renderer/renderer-checked.js';
import TokenRenderer     from './renderer/renderer-token.js';
import ValueRenderer     from './renderer/renderer-value.js';
import TextRenderer      from './renderer/renderer-text.js';

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

function throwError(message) {
    throw new Error(message);
}

assign(Renderer, {
    create: function(element, n, fn, parameters) {
        // If name is an index
        return typeof n === 'number' ?
            // of text node
            element.childNodes[n].nodeType === 3 ?
                // Return a text renderer
                new TextRenderer(fn, element, n, parameters) :
            throwError('Renderer.create() – child at index is not a text node') :
            // Return some type of attribute renderer
            new (renderers[n] || AttributeRenderer)(fn, element, n, parameters) ;
    }
});

export default Renderer;


import arg               from '../../../fn/modules/arg.js';
import overload          from '../../../fn/modules/overload.js';
import decode            from '../../../dom/modules/decode.js';
import scope             from '../scope.js';
import AttributeRenderer from '../renderer/renderer-attribute.js';
import BooleanRenderer   from '../renderer/renderer-boolean.js';
import CheckedRenderer   from '../renderer/renderer-checked.js';
import TokensRenderer    from '../renderer/renderer-tokens.js';
import ValueRenderer     from '../renderer/renderer-value.js';
import isLiteralString   from './is-literal-string.js';
import truncate          from './truncate.js';
import compile           from './compile.js';



/**
compileAttributes(array, element, attribute, path, message)
**/

const constructors = {
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

export default function compileAttribute(array, element, attribute, path, message = '', options) {
    const name   = attribute.localName;
    const source = attribute.value;

    if (!isLiteralString(source)) { return; }

    if (window.DEBUG) {
        message = truncate(64, '<'
            + element.tagName.toLowerCase() + ' '
            + name + '="' + source
            + '">')
            + ' (' + message + ')' ;
    }

    const Renderer = constructors[name] || AttributeRenderer;

    array.push({
        Renderer: Renderer,
        fn: compile(source, scope, Renderer.parameterNames.join(', '), message, options),
        element,
        path,
        name
    });

    // Avoid errant template literals making booleans default to true, mangling
    // classes, and unnecessarily checking checkboxes. This has been moved here
    // from AttributeRenderer, as it seems `new AttributeRenderer()` does not
    // the attribute to be present, and its optimum to operate on the template
    // DOM rather than each cloned DOM.
    element.removeAttribute(name);

    return array;
}
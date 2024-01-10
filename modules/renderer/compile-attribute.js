
import arg               from '../../../fn/modules/arg.js';
import overload          from '../../../fn/modules/overload.js';
import decode            from '../../../dom/modules/decode.js';
import isLiteralString   from '../is-literal-string.js';
import AttributeRenderer from './renderer-attribute.js';
import BooleanRenderer   from './renderer-boolean.js';
import CheckedRenderer   from './renderer-checked.js';
import TokensRenderer    from './renderer-tokens.js';
import ValueRenderer     from './renderer-value.js';
import TextRenderer      from './renderer-text.js';
import truncate          from './truncate.js';


/**
compileAttributes(renderers, element, attribute, path, message)
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
    default:        BooleanRenderer,

    // Workaround attribute used in cases where ${} cannot be added directly to
    // HTML, such as in <tbody> or <tr>
    'inner-html': function(path, name, source, message, options, element) {
        element.removeAttribute(name);
        return new TextRenderer(path, 0, decode(source), message, options, element.childNodes[0]);
    }
};

export default function compileAttribute(renderers, element, attribute, path, message = '', options) {
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

    const Constructor = constructors[name] || AttributeRenderer;
    renderers.push(new Constructor(path, name, source, message, options, element));
    return renderers;
}

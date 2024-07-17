
import scope             from '../scope.js';
import names             from '../renderer/property-names.js';
import AttributeRenderer from '../renderer/renderer-attribute.js';
import BooleanRenderer   from '../renderer/renderer-boolean.js';
import CheckedRenderer   from '../renderer/renderer-checked.js';
import TokensRenderer    from '../renderer/renderer-tokens.js';
import ValueRenderer     from '../renderer/renderer-value.js';
import isLiteralString   from './is-literal-string.js';
import truncate          from './truncate.js';
import compile           from './compile.js';


/**
compileAttributes(array, element, attribute, path, options[, debug])
**/

export default function compileAttribute(array, element, attribute, path, options, debug) {
    const name   = attribute.localName;
    const source = attribute.value;

    if (!isLiteralString(source)) { return; }

    const message = window.DEBUG ?
        truncate(64, '<'
            + element.tagName.toLowerCase() + ' '
            + name + '="' + source
            + '">') :
        '' ;

    // We need the Renderer here just to get .parameterNames. This is a bit
    // clunky, but the whole passing parameters to compiled functions thing is,
    // anyway.
    const property = names[name] || name;
    const Renderer =
        property === 'value'   ? ValueRenderer :
        property === 'checked' ? CheckedRenderer :
        typeof element[property] === 'boolean' ? BooleanRenderer :
        typeof element[property] === 'object' && element[property].add && element[property].remove ? TokensRenderer :
        AttributeRenderer ;

    array.push({
        literal: compile(source, scope, Renderer.parameterNames.join(', '), message, options),
        source,
        path,
        name,
        message,
        template: debug && debug.template
    });

    // Avoid errant template literals making booleans default to true, mangling
    // classes, and unnecessarily checking checkboxes. This has been moved here
    // from AttributeRenderer (`new AttributeRenderer()` does not need the
    // attribute to be present, and its optimum to operate on the template DOM
    // rather than each cloned DOM).
    element.removeAttribute(name);

    return array;
}

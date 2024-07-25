
import scope             from '../scope.js';
import names             from '../renderer/property-names.js';
import AttributeRenderer from '../renderer/renderer-attribute.js';
import BooleanRenderer   from '../renderer/renderer-boolean.js';
import CheckedRenderer   from '../renderer/renderer-checked.js';
import DatasetRenderer   from '../renderer/renderer-dataset.js';
import TokensRenderer    from '../renderer/renderer-tokens.js';
import ValueRenderer     from '../renderer/renderer-value.js';
import isLiteralString   from './is-literal-string.js';
import truncate          from './truncate.js';
import compile           from './compile.js';
import { printError } from '../scope/print.js';


const assign = Object.assign;


/**
compileAttributes(array, element, attribute, path, options[, debug])
**/

export default function compileAttribute(array, element, attribute, path, options, debug) {
    const source = attribute.value;
    if (!isLiteralString(source)) { return; }

    const name   = attribute.localName;
    const tag    = element.tagName.toLowerCase();

    // TODO: custom elements need to be flagged as potentially upgradeable, and
    // we shall have to devise a way of upgrading their renderers. The problem
    // is that their properties may become available later. The other test is
    // to see if the element is registered yet with customElements.get(), but
    // that does not help here. Even if it is registered, element is currently
    // inside a fragment so has not yet been upgraded.
    const upgradeable = /-/.test(tag) || element.getAttribute('is');
    const property    = name in names ? names[name] : name;

    // We need the Renderer here just to get .parameterNames. This is a bit
    // clunky, but the whole passing parameters to compiled functions thing is,
    // anyway. Needs a once-over.
    const Renderer = /^data-/.test(name) ? DatasetRenderer :
        property in element ?
            property === 'value'   ? ValueRenderer :
            property === 'checked' ? CheckedRenderer :
            typeof element[property] === 'boolean' ? BooleanRenderer :
            typeof element[property] === 'object' && element[property].add && element[property].remove ? TokensRenderer :
        AttributeRenderer :
    AttributeRenderer ;

    const params = Renderer.parameterNames.join(', ');
    const target = { source, path, name, upgradeable, Renderer };

    if (window.DEBUG) {
        const code = truncate(64, '<'
            + tag + ' '
            + name + '="' + source
            + '">') ;

        // Fill target object with debug info
        assign(target, debug, { tag, code, property });

        // Attempt to compile, and in case of an error replace element with
        // an error element
        try {
            target.literal = compile(source, scope, params, options, code);
        }
        catch(error) {
            element.replaceWith(printError(target, error));
            return array;
        }
    }
    else {
        target.literal = compile(source, scope, params, options);
    }

    array.push(target);

    // Avoid errant template literals making booleans default to true, mangling
    // classes, and unnecessarily checking checkboxes. This has been moved here
    // from AttributeRenderer (`new AttributeRenderer()` does not need the
    // attribute to be present, and its optimum to operate on the template DOM
    // rather than each cloned DOM).
    element.removeAttribute(name);

    return array;
}

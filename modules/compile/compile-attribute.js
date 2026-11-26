
import isMutableProperty from 'fn/is-mutable-property.js';
import scope             from '../scope.js';
import names             from '../renderer/property-names.js';
import AttributeRenderer from '../renderer/renderer-attribute.js';
import BooleanRenderer   from '../renderer/renderer-boolean.js';
import CheckedRenderer   from '../renderer/renderer-checked.js';
import DatasetRenderer   from '../renderer/renderer-dataset.js';
import OnRenderer        from '../renderer/renderer-on.js';
import StyleRenderer     from '../renderer/renderer-style.js';
import TokensRenderer    from '../renderer/renderer-tokens.js';
import ValueRenderer     from '../renderer/renderer-value.js';
import isLiteralString   from './is-literal-string.js';
import truncate          from './truncate.js';
import { compileExpression, compileLiteral, rsingle } from './compile.js';
import { printError }    from '../print.js';


const DEBUG = globalThis.DEBUG;


/**
compileAttributes(array, element, attribute, path, options[, debug])
**/

export default function compileAttribute(array, element, attribute, path, options, template) {
    const source = attribute.value;
    if (!isLiteralString(source)) { return; }

    const name = attribute.localName;
    const tag  = element.tagName.toLowerCase();

    // TODO: custom elements need to be flagged as potentially upgradeable, and
    // we shall have to devise a way of upgrading their renderers. The problem
    // is that their properties may become available later. The other test is
    // to see if the element is registered yet with customElements.get(), but
    // that does not help here. Even if it is registered, element is currently
    // inside a fragment so has not yet been upgraded.
    const upgradeable = /-/.test(tag) || element.getAttribute('is');
    const mapped      = name in names ? names[name] : name;

    // We need the Renderer here just to get .consts. This is a bit
    // clunky, but the whole passing parameters to compiled functions thing is,
    // anyway. Needs a once-over.
    const Renderer = /^data-/.test(name) ? DatasetRenderer :
        mapped in element ?
            mapped === 'value'   ? ValueRenderer :
            mapped === 'checked' ? CheckedRenderer :
            mapped === 'style'   ? StyleRenderer :
            mapped.startsWith('on') ? OnRenderer :
            typeof element[mapped] === 'boolean' ? BooleanRenderer :
            typeof element[mapped] === 'object' && element[mapped].add && element[mapped].remove ? TokensRenderer :
            AttributeRenderer :
        AttributeRenderer ;

    // Resolve mutable property once at compile time (TokensRenderer reads element[property])
    const property = mapped
        && (mapped in element)
        && (Renderer === TokensRenderer || isMutableProperty(mapped, element)) ?
            mapped :
            undefined ;

    const target  = { path, name, property, source, Renderer, upgradeable, template };
    const trimmed = source.trim();
    const match   = rsingle.exec(trimmed);

    let code;

    if (DEBUG) {
        code = truncate(80, '<'
            + tag + ' '
            + name + '="' + source
            + '">') ;

        // Fill target object with debug info
        target.tag  = tag;
        target.code = code;
    }

    // Attempt to compile single expression `${ expr }` render function...
    if (match) {
        try {
            target.literal          = compileExpression(match[1], scope, Renderer.consts, options, code);
            target.singleExpression = true;
        }
        catch (_error) {}
    }

    // That failed where code was not really a single expression, so now
    // compile template literal render function
    if (!target.literal) {
        if (DEBUG) {
            try {
                target.literal = compileLiteral(trimmed, scope, Renderer.consts, options, code);
            }
            catch (error) {
                // Replace element with an error element
                element.replaceWith(printError(target, error));
                return array;
            }
        }
        else {
            target.literal = compileLiteral(trimmed, scope, Renderer.consts, options);
        }
    }

    // Avoid errant template literals making booleans default to true, mangling
    // classes, and unnecessarily checking checkboxes. This has been moved here
    // from AttributeRenderer (`new AttributeRenderer()` does not need the
    // attribute to be present, and its optimum to operate on the template DOM
    // rather than each cloned DOM).
    element.removeAttribute(name);

    // Add compiled target object to the list
    array.push(target);
    return array;
}

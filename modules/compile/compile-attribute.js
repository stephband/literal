
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
import R                 from '../renderer/renderer.js';
import isLiteralString   from './is-literal-string.js';
import truncate          from './truncate.js';
import compile           from './compile.js';
import { printError }    from '../print.js';


const assign = Object.assign;


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
    const property    = name in names ? names[name] : name;

    // We need the Renderer here just to get .consts. This is a bit
    // clunky, but the whole passing parameters to compiled functions thing is,
    // anyway. Needs a once-over.
    const Renderer = /^data-/.test(name) ? DatasetRenderer :
        property in element ?
            property === 'value'   ? ValueRenderer :
            property === 'checked' ? CheckedRenderer :
            property === 'style'   ? StyleRenderer :
            property.startsWith('on') ? OnRenderer :
            typeof element[property] === 'boolean' ? BooleanRenderer :
            typeof element[property] === 'object' && element[property].add && element[property].remove ? TokensRenderer :
            AttributeRenderer :
        AttributeRenderer ;

    const target = { path, name, source, Renderer, upgradeable, template };

    if (window.DEBUG) {
        const code = truncate(80, '<'
            + tag + ' '
            + name + '="' + source
            + '">') ;

        // Fill target object with debug info
        target.tag      = tag;
        target.code     = code;
        target.property = property;

        // Attempt to compile, and in case of an error replace element with
        // an error element
        try {
            target.literal = compile(source, scope, Renderer.consts, options, code);
        }
        catch(error) {
            element.replaceWith(printError(target, error));
            return array;
        }
    }
    else {
        target.literal = compile(source, scope, Renderer.consts, options);
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

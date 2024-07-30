
import Signal    from 'fn/signal.js';
import AttributeRenderer, { toAttributeString } from './renderer-attribute.js';
import { stats } from './renderer.js';

const assign = Object.assign;

/**
DatasetRenderer(signal, literal, consts, element, name)
Constructs an object responsible for rendering to the `.dataset` property.
**/

export default class StyleRenderer extends AttributeRenderer {
    static consts = AttributeRenderer.consts;

    constructor(signal, literal, consts, element, name, debug) {
        super(signal, literal, consts, element, 'style', debug);
        Signal.evaluate(this, this.evaluate);
    }

    render(strings) {
        // Intercept single expressions that evaluate to an object, treat object
        // as object of CSS property:value rules
        if (this.singleExpression && typeof arguments[1] === 'object') {
            assign(this.element.style, arguments[1]);
            if (window.DEBUG) ++stats.property;
            return;
        }

        // Otherwise treat as any other attribute
        return super.render.apply(this, arguments);
    }
}

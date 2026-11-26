
import AttributeRenderer from './renderer-attribute.js';
import { stats } from './renderer.js';


const assign = Object.assign;


/**
StyleRenderer(signal, literal, consts, element, name)
Constructs an object responsible for rendering to the `.style` property.
**/

export default class StyleRenderer extends AttributeRenderer {
    renderSingle(value) {
        // Intercept object values and assign CSS property:value rules directly
        if (typeof value === 'object' && value !== null) {
            assign(this.element.style, value);
            if (window.DEBUG) ++stats.property;
            return;
        }

        // Otherwise treat as a style string attribute/property
        return super.renderSingle(value);
    }

    render() {
        // Multi-expression style string
        return super.render.apply(this, arguments);
    }
}

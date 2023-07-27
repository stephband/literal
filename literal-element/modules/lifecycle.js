
// Lifecycle for <template is="literal-element">

import nothing          from '../../../fn/modules/nothing.js';
import { getInternals } from '../../../dom/modules/element.js';
import defineElement    from '../../modules/define-element.js';

const assign = Object.assign;
const ignore = {
    is:          true,
    loading:     true
};

const rhashsplit = /^[^#]*#(.*$)/;
const resolved = Promise.resolve();

function isDefineableAttribute(attribute) {
    return !ignore[attribute.name];
    //console.error('<template is="literal-element"> Not permitted to define property ' + attribute.localName + '="' + attribute.value + '"');
}

function assignProperty(properties, attribute) {
    if (isDefineableAttribute(attribute)) {
        properties[attribute.name] = attribute.value;
    }

    return properties;
}

export default {
    connect: function() {
        const internals = getInternals(this);

        if (!internals.tag) {
            throw new SyntaxError('<template is="literal-element"> must have an attribute tag="name-of-element"');
        }

        const attributes = internals.attributes ?
            internals.attributes.reduce(assignProperty, {}) :
            nothing ;

        if (internals.src) {
            internals.src.then((module) => {
                const scope = assign({}, module);
                delete scope.default;
                defineElement(internals.tag, this, module.default || {}, attributes, scope, internals.stylesheets)
            });
        }
        else {
            defineElement(internals.tag, this, {}, attributes, {}, internals.stylesheets);
        }
    }
}

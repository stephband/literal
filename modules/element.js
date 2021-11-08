
/** <xy-input>

Import `<xy-input>` custom element. This also registers the custom 
element and upgrades instances already in the DOM.

```html
<script type="module" src="./module.js"></script>

<style>
    xy-input {
        width: 100%;
        height: 6.25rem;
    }
</style>

<xy-input></xy-input>
<xy-input name="points" value="100 0dB one 200 6dB two 2000 -6dB three" ymin="-18dB" ymax="18dB" xmin="20" xmax="20000" xlaw="logarithmic-96dB" ylaw="logarithmic-48dB" xaxis="Hz" yaxis="dB"></xy-input>
```
**/

import { clamp }   from '../../../fn/modules/clamp.js';
import id          from '../../../fn/modules/id.js';
import get         from '../../../fn/modules/get.js';
import last        from '../../../fn/modules/last.js';
import overload    from '../../../fn/modules/overload.js';
import noop        from '../../../fn/modules/noop.js';
import { Observer, notify, getTarget } from '../../../fn/observer/observer.js';

import delegate    from '../../../dom/modules/delegate.js';
import element     from '../../../dom/modules/element.js';
import events      from '../../../dom/modules/events.js';
import gestures    from '../../../dom/modules/gestures.js';
import rect        from '../../../dom/modules/rect.js';
import { trigger } from '../../../dom/modules/trigger.js';
import { px, rem } from '../../../dom/modules/parse-length.js';

import Literal     from '../../../literal/module.js';

import axes        from './axes.js';
import scales      from './scales.js';
import Data        from './data.js';
import parseValue  from './parse-value.js';
import parseTicks  from './parse-ticks.js';
import parsePoints from './parse-points.js';

const assign = Object.assign;

const $state = Symbol('state');

const maxTapDuration = 0.25;
const maxDoubleTapDuration = 0.4;
const defaultTargetEventDuration = 0.4;





/*
toCoordinates()
Turn gesture positions into coordinates
*/

function updateBoxes(element, pxbox, paddingbox, contentbox, rangebox) {
    const box           = rect(element);
    const computed      = getComputedStyle(element);
    const fontsize      = px(computed['font-size']);
    const borderLeft    = px(computed.borderLeftWidth) || 0;
    const borderTop     = px(computed.borderTopWidth) || 0;
    const borderRight   = px(computed.borderRightWidth) || 0;
    const borderBottom  = px(computed.borderBottomWidth) || 0;
    const paddingLeft   = px(computed.paddingLeft) || 0;
    const paddingTop    = px(computed.paddingTop) || 0;
    const paddingRight  = px(computed.paddingRight) || 0;
    const paddingBottom = px(computed.paddingBottom) || 0;

    pxbox.x      = box.x + borderLeft + paddingLeft;
    pxbox.y      = box.y + borderTop + paddingTop;
    pxbox.width  = box.width  - borderLeft - paddingLeft - borderRight - paddingRight;
    pxbox.height = box.height - borderTop - paddingTop - borderBottom - paddingBottom;

    paddingbox.x      = 0;
    paddingbox.y      = 0;
    paddingbox.width  = box.width - borderLeft - borderRight;
    paddingbox.height = box.height - borderTop - borderBottom;

    contentbox.x      = paddingLeft;
    contentbox.y      = paddingTop;
    contentbox.width  = box.width  - borderLeft - paddingLeft - borderRight - paddingRight;
    contentbox.height = box.height - borderTop - paddingTop - borderBottom - paddingBottom;

    rangebox[0] = 0;
    rangebox[2] = contentbox.width / fontsize;
    rangebox[1] = 0;
    rangebox[3] = -contentbox.height / fontsize;

    return box;
}

const properties = {
    data: {
        /**
        .data
        The value of the element.
        **/
        get: function() {
            return Observer(this[$data]);
        },

        set: function(values) {
            const { data, internal, formdata } = this[$state];

            Observer(data).points = typeof values === 'string' ?
                parsePoints(values) :
                getTarget(values) ;

            setFormValue(internal, formdata, this.name, data.points);
        },

        enumerable: true
    }
};

export default function element(name, template, life, prop) {
    customElement(name, assign(life, lifecycle, {
        construct: function() {
            const literal  = new Literal(template);
            const data = this[$data] = life.construct ?
                life.construct.apply(this, arguments) :
                {} ;

            data.rendered = literal.render(data);
        },

        load: function() {
            const data = this[$data]life.ready && life.ready.apply(this, arguments);
            assign(data, life.ready && life.ready.apply(this, arguments));
            data.rendered.then(() => {
                shadow.appendChild(literal.content);
                literal.connect();
            });
        }
    }), assign(prop, properties));
}

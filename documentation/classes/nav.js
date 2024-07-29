
import { clamp } from 'fn/clamp.js';
import events    from 'dom/events.js';


events({ type: 'scroll', capture: true }, window)
.reduce((r, e) => {
    const scrollingElement = document.scrollingElement;
    const scrollTop        = clamp(0, 200, scrollingElement.scrollTop);
    const scrollRatio      = scrollTop / 200;
    if (scrollRatio === r) { return r; }
    document.body.style.setProperty('--nav-scroll-ratio', scrollRatio);
    return scrollRatio;
});

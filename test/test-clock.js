
import { Observer } from '../../fn/observer/observer.js';

const clock = { time: 0 };
const data  = Observer(clock);

const interval = setInterval(function() {
    data.time = Math.round(window.performance.now() / 1000);
    if (clock.time > 10) {
        clearInterval(interval);
    }
}, 1000);

export default clock;

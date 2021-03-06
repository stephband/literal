
import { Observer } from '../../fn/observer/observer.js';

const clock = Observer({ time: 0 });

const interval = setInterval(function() {
    clock.time = window.performance.now() / 1000;
}, 1000);

export default clock;

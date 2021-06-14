
import Observer from '../modules/observer.js';

const clock = Observer({
    time: 0
});

const interval = setInterval(function() {
    clock.time = window.performance.now() / 1000;
    if (clock.time > 10) {
        clearInterval(interval);
    }
}, 1000);

export default clock;

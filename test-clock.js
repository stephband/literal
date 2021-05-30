
import Observer from './modules/observer.js';

const clock = Observer({
    time: 0
});

setInterval(function() {
    clock.time = window.performance.now() / 1000;
}, 1000);

export default clock;

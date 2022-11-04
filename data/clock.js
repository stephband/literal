
import { Data } from '../module.js';

// The clock object must be wrapped as a Data() proxy so that literal
// templates 'see' it mutate
const clock = Data({ time: 0 });

setInterval(function() {
    clock.time = window.performance.now() / 1000;
}, 1000);

export default clock;

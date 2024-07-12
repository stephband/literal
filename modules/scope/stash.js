
import overload from '../../../fn/modules/overload.js';

const $stash = Symbol('stash');

export default overload(function() { return arguments.length; }, {
    1: (object) => object[$stash],
    2: (object, data) => object[$stash] = data
});

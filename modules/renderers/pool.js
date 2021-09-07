
function isIdle(renderer) {
    return renderer.status === 'idle';
}

function pool(Constructor, reset, find, store) {
    var store = {};

    return function Pooled(node, options) {
        var object = store[options.source]
            && store[options.source].find(isIdle);

        if (object) {
            reset.apply(object, arguments);
        }
        else {
            const list = store[options.source] || (store[options.source] = []); 
            object = new Constructor(...arguments);
            list.push(object);
        }

        return object;
    });
}

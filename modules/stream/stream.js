
const assign = Object.assign;
const define = Object.defineProperties;

export const properties = { producer: { value: [] }};

export default function Stream(producers) {
    // Define `producers` as unenumerable property
    properties.producers.value = producers;
    define(this, properties);
}

assign(Stream.prototype, {
    each: function(consumer) {
        start(this, consumer);
        return this;
    },

    pipe: function(consumer) {
        stop(this, consumer);
        return consumer;
    },

    stop: function() {
        stop(this);
        return this;
    }
});

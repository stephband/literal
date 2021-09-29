
import id      from '../../../fn/modules/id.js';
import nothing from '../../../fn/modules/nothing.js';

const assign = Object.assign;
const create = Object.create;
const define = Object.defineProperties;


/**
Stream()
**/

const properties = {
    consumer:  { writable: true },
    stopables: { writable: true }
};

const producerProperties = {
    push: function() {
        const length = arguments.length;
        let n = -1;
        while (++n < length) {
            this.consumer.push(arguments[n]);
        }
    },
    
    stop: function() {
        console.log('stream.stop()');
    }
};

function stop(stopable) {
    return stopable.stop ?
        stopable.stop() : 
        stopable() ;
}

function done(stopables) {
    stopables.forEach(stop);
    stopables.length = 0;
}

export default function Stream(start) {
    if (!start) {
        return new Pushable();
    }

    const stream = this;

    this.start = function() {
        start(assign(create(stream), producerProperties));
        return this;
    };
}

assign(Stream.prototype, {
    /** 
    .map()
    **/
    map: function(fn) {
        return this.pipe(new Map(fn));
    },

    /** 
    .filter()
    **/
    filter: function(fn) {
        return this.pipe(new Filter(fn));
    },

    /** 
    .reduce()
    **/
    reduce: function(fn, accumulator) {
        return this.pipe(new Reduce(fn, accumulator));
    },

    /** 
    .each()
    **/
    each: function(fn) {
        return this.pipe(new Each(fn)).start();
    },

    /** 
    .pipe()
    **/
    pipe: function(consumer) {
        consumer.start = this.start;
        consumer.done && consumer.done(this);
        return this.consumer = consumer;
    },

    /** 
    .done()
    **/
    done: function(stopable) {
        this.stopables = this.stopables || [];
        this.stopables.push(stopable);
        return this;
    },

    /** 
    .start()
    **/
    start: function() {
        console.log('START not done');
    },

    /** 
    .stop()
    **/
    stop: function() {
        this.consumer = nothing;
        this.stopables && done(this.stopables);
        return this;
    }
});

assign(Stream, {
    /**
    Stream.from(values)
    **/
    from: function(values) {
        return new Stream((push) => push.apply(null, values));
    },

    /**
    Stream.of(value1, value2, ...)
    **/
    of: function() {
        return this.from(arguments);
    }
});


/*
Pushable()
*/

function Pushable() {}

Pushable.prototype = create(Stream.prototype);

Pushable.prototype.push = function(value) {
    if (!this.consumer) { return this; }
    let n = -1;
    while (++n < arguments.length) {
        this.consumer.push(arguments[n]);
    }
    return this;
};


/*
Map()
*/

const mapProperties = assign({ fn: { value: id }}, properties);

function Map(fn) {
    mapProperties.fn.value = fn;
    define(this, mapProperties);
}

Map.prototype = create(Stream.prototype);

Map.prototype.push = function push(value) {
    if (value !== undefined) {
        this.consumer.push(this.fn(value));
    }
    return this;
};


/*
Filter()
*/

function Filter(fn) {
    mapProperties.fn.value = fn;
    define(this, properties);
}

Filter.prototype = create(Stream.prototype);

Filter.prototype.push = function push(value) {
    if (value !== undefined && this.fn(value)) {
        this.consumer.push(value);
    }

    return this;
};


/*
Reduce()
*/

const reduceProperties = assign({ accumulator: { writable: true } }, mapProperties);

function Reduce(fn, accumulator) {
    reduceProperties.fn.value = fn;
    reduceProperties.accumulator.value = accumulator;
    define(this, reduceProperties);
}

Reduce.prototype = create(Stream.prototype);

Reduce.prototype.push = function(value) {
    if (value !== undefined) {
        this.value = this.fn(this.value, value);
        this.consumer.push(this.value);
    }

    return this;
};


/*
Each()
*/

function Each(fn) {
    this.push = fn;
}

Each.prototype = create(Stream.prototype);

Each.prototype.pipe = function() {
    throw new Error('Stream cannot .pipe() from consumed stream');
};
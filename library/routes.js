
import { register } from '../modules/library.js';
import Observer, { mutations } from '../modules/observer.js';
import { defaults } from '../data/location.js';

const DEBUG = window.DEBUG && (window.DEBUG === true || window.DEBUG.includes('routes'));

const assign = Object.assign;

/*
function stop(route) {
    //console.trace('stop', distributor);
    const handlers = route.handlers;
    var n = -1;
    var handler;

    while (handler = handlers[++n]) {
        handler.stop && handler.stop();
    }

    // Throw away references to all handlers
    handlers.length = 0;

    // End of route group ***
    if (DEBUG) { console.groupEnd(); }
}
*/

function Route(base, path, route, captures) {
    this.base       = base;
    this.path       = path;
    this.route      = route;

    var n = -1;
    while(captures[++n] !== undefined) {
        this['$' + n] = captures[n];
    }
}

assign(Route.prototype, {
    params:     defaults.params,
    identifier: defaults.identifier,
    state:      defaults.state
});
let pk = 0;
function updateRoute(patterns, keys, regexps, location, data) {
    const base   = location.base + location.path;
    const string = location.route;
    let { route } = data;

    // Loop through regexes until a match is captured
    var regexp, captures, n = -1;

    while(
        (regexp = regexps[++n]) && 
        !(captures = regexp.exec(string))
    ); // Semicolon important here, don't remove

    // Ignore unmatching handlers
    if (!captures) {
        data.mutations && data.mutations.stop();
        data.route = undefined;
        data.mutations = undefined;
        return data;
    }

    const key  = keys[n];
    const path = captures.input.slice(0, captures.index + captures[0].length);
    const name = captures.input.slice(captures.index + captures[0].length);

    // Where .base and .path have not changed, .route must have changed
    // and params, identifier and state may have changed, so we update the 
    // existing route and notify as route
    if (route && route.base === base && route.path === path) {
        route.route = name;
        //route.params      = location.params;
        //route.indentifier = location.identifier;
        //route.state       = location.state;
        return data;
    }

    // Start of route group ***
    if (DEBUG) { console.group('route ' + path); }

    data.mutations && data.mutations.stop();

    // Create a new route object
    route = new Route(base, path, name, captures);
route.pk = ++pk;
    // Update params, identifier, state
    route.params = location.params;
    route.id     = location.id;
    route.state  = location.state;

    const observer = Observer(route);

    data.mutations = mutations('params id state', location, (names) => {
        console.log('Route mutated', names, route.pk);
        var n = -1, name;
        while ((name = names[++n]) !== undefined) {
            observer[name] = location[name];
        }
    });

    // Call route handler with (route, $1, $2, ...)
    data.route = patterns[key](observer);
    return data;
}

register('routes', function routes(patterns) {
    const keys    = Object.keys(patterns);
    const regexps = keys.map((pattern) => RegExp(pattern));

    var data = {};

    function routes(location) {
        data = updateRoute(patterns, keys, regexps, location, data);
        if (!data.route) { return; }
        return data.route;
    }

    // Allow partial application:
    // fn = routes(patterns)
    // fn(route)
    // or
    // routes(patterns, route)
    return arguments.length > 1 ?
        routes(arguments[1]) :
        routes ;
});

window.O = Observer;
window.m = mutations;

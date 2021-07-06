
import { register } from '../modules/library.js';
import Observer     from '../modules/observer.js';
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

function router(patterns, keys, regexps, location, route) {
    const base   = location.base + location.path;
    const string = location.route;

    // Loop through regexes until a match is captured
    var regexp, captures, n = -1;

    while(
        (regexp = regexps[++n]) && 
        !(captures = regexp.exec(string))
    ); // Semicolon important here, don't remove

    // Ignore unmatching handlers
    if (!captures) { return; }

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
        return route;
    }

    // Stop old route and create a new one
    //route && stop(route);
    //changes.stop();

    // Start of route group ***
    if (DEBUG) { console.group('route ' + path); }

    // Create a new route object
    route = new Route(base, path, name, captures);

    // Update params, identifier, state
    route.params = location.params;
    route.id     = location.id;
    route.state  = location.state;

    const observer = Observer(route);

    // Call route handler with (route, $1, $2, ...)
    patterns[key].apply(this, observer);

    //mutations(location).each((changes) => route && assign(route, changes));

    return route;
}

register('routes', function routes(patterns) {
    const keys    = Object.keys(patterns);
    const regexps = keys.map((pattern) => RegExp(pattern));

    var route;

    function routes(location) {
        route = router(patterns, keys, regexps, location);
        if (!route) { return; }
        return route;
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
